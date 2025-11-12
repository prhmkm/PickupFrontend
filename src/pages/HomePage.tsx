import React, { useEffect, useMemo, useState } from "react";
import {
  deleteBucket,
  fetchData,
  fetchItemDetails,
  DeviceDetailDto,
  DeviceDto,
} from "../services/api";
import BatteryIcon from "../components/BatteryIcon";
import { toBatteryPercentage } from "../utils/battery";
import BucketIcon from "../components/BucketIcon";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface HomePageProps {
  onLogout?: () => void;
}

type Device = DeviceDto;
type DeviceDetail = DeviceDetailDto;

type SortKey =
  | "serialNumber"
  | "phoneNumber"
  | "batteryAmount"
  | "tankVolume"
  | "creationDatetime"
  | "deviceStatus";

const customIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [2, -35],
  shadowSize: [41, 41],
});

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "device-details", label: "Device Details" },
  { id: "maintenance", label: "Maintenance Logs" },
  { id: "calibration", label: "Calibration & AI" },
  { id: "notifications", label: "Notifications" },
  { id: "live", label: "Live Map" },
];

const statusLabel = (status: number) => {
  if (status === 1) {
    return { label: "Connected", tone: "bg-emerald-50 text-emerald-600" };
  }
  if (status === 2) {
    return { label: "Sleeping", tone: "bg-sky-50 text-sky-600" };
  }
  return { label: "Disconnected", tone: "bg-rose-50 text-rose-600" };
};

const parseLocation = (loc?: string | null): [number, number] | null => {
  if (!loc) return null;
  const [lat, lng] = loc.split(",").map((value) => Number(value.trim()));
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return [lat, lng];
  }
  return null;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const HomePage: React.FC<HomePageProps> = ({ onLogout }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [previewDevice, setPreviewDevice] = useState<Device | null>(null);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetail[]>([]);
  const [mapLocation, setMapLocation] = useState<[number, number] | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Device | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    day: "all",
    sense: "all",
    minLevel: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const token = localStorage.getItem("token") ?? "";

  useEffect(() => {
    const loadDevices = async () => {
      setIsLoading(true);
      const result = await fetchData(token);
      if (result?.value?.response) {
        setDevices(result.value.response);
      }
      setIsLoading(false);
    };
    if (token) {
      loadDevices();
    }
  }, [token]);

  useEffect(() => {
    if (!selectedDevice || !showDetailsModal) {
      return;
    }
    const loadDetails = async () => {
      setDetailsLoading(true);
      const details = await fetchItemDetails(
        selectedDevice.id,
        token,
        pageSize,
        pageNumber
      );
      if (details?.value?.response) {
        setDeviceDetails(details.value.response);
      } else {
        setDeviceDetails([]);
      }
      setDetailsLoading(false);
    };
    loadDetails();
  }, [selectedDevice, pageSize, pageNumber, showDetailsModal, token]);

  const distinctDays = useMemo(() => {
    return Array.from(new Set(devices.map((item) => item.day).filter(Boolean)));
  }, [devices]);

  const distinctSense = useMemo(() => {
    return Array.from(
      new Set(devices.map((item) => item.sense).filter(Boolean))
    );
  }, [devices]);

  const filteredDevices = useMemo(() => {
    const { search, status, day, sense, minLevel } = filters;
    const searchLower = search.trim().toLowerCase();
    return devices
      .filter((device) => {
        if (
          searchLower &&
          ![device.serialNumber, device.phoneNumber, device.day, device.sense]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(searchLower))
        ) {
          return false;
        }
        if (status === "connected" && device.deviceStatus !== 1) return false;
        if (status === "sleep" && device.deviceStatus !== 2) return false;
        if (
          status === "offline" &&
          (device.deviceStatus === 1 || device.deviceStatus === 2)
        ) {
          return false;
        }
        if (day !== "all" && device.day !== day) return false;
        if (sense !== "all" && device.sense !== sense) return false;

        const minLevelValue = Number(minLevel);
        if (!Number.isNaN(minLevelValue) && device.tankVolume < minLevelValue) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const order = direction === "asc" ? 1 : -1;
        const aValue = a[key];
        const bValue = b[key];
        if (key === "creationDatetime") {
          return (
            (new Date(aValue).getTime() - new Date(bValue).getTime()) * order
          );
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return (aValue - bValue) * order;
        }
        return String(aValue).localeCompare(String(bValue)) * order;
      });
  }, [devices, filters, sortConfig]);

  const stats = useMemo(() => {
    const total = devices.length;
    const connected = devices.filter(
      (device) => device.deviceStatus === 1
    ).length;
    const sleeping = devices.filter(
      (device) => device.deviceStatus === 2
    ).length;
    const offline = total - connected - sleeping;
    const avgBattery =
      total > 0
        ? Math.round(
            devices.reduce(
              (sum, device) => sum + toBatteryPercentage(device.batteryAmount),
              0
            ) / total
          )
        : 0;
    const avgTank =
      total > 0
        ? Math.round(
            devices.reduce((sum, device) => sum + device.tankVolume, 0) / total
          )
        : 0;
    return { total, connected, offline, sleeping, avgBattery, avgTank };
  }, [devices]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      return {
        key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const handleOpenDetails = (device: Device) => {
    setSelectedDevice(device);
    setPageNumber(1);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setDeviceDetails([]);
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    await deleteBucket(deleteCandidate.id, token);
    setDevices((prev) => prev.filter((item) => item.id !== deleteCandidate.id));
    setDeleteCandidate(null);
    setShowDeleteModal(false);
  };

  const handleLocate = (device: Device) => {
    const location = parseLocation(device.location);
    if (!location) return;
    setSelectedDevice(device);
    setMapLocation(location);
    setShowMapModal(true);
  };

  const mapDevices = filteredDevices.filter((device) =>
    parseLocation(device.location)
  );

  const firstMapLocation =
    mapDevices.length > 0 ? parseLocation(mapDevices[0].location) : null;

  const previewLocation = previewDevice
    ? parseLocation(previewDevice.location)
    : null;

  const defaultCenter: [number, number] = firstMapLocation ?? [52.42, 10.79];

  const renderDashboardSection = () => (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <span className="pointer-events-none absolute left-4 top-3.5 text-slate-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </span>
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              placeholder="Search by serial, phone, day or sense..."
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
            />
          </div>

          <select
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:w-auto"
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, status: event.target.value }))
            }
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="sleep">Sleep</option>
            <option value="offline">Offline</option>
          </select>

          <select
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:w-auto"
            value={filters.day}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, day: event.target.value }))
            }
          >
            <option value="all">All Days</option>
            {distinctDays.map((day) => (
              <option key={day} value={day ?? ""}>
                {day}
              </option>
            ))}
          </select>

          <select
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:w-auto"
            value={filters.sense}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, sense: event.target.value }))
            }
          >
            <option value="all">All Sensors</option>
            {distinctSense.map((sense) => (
              <option key={sense} value={sense ?? ""}>
                {sense}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            max={100}
            placeholder="Min Level (%)"
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm text-slate-600 transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:w-auto lg:w-40"
            value={filters.minLevel}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                minLevel: event.target.value,
              }))
            }
          />

          <button
            onClick={() => {
              setFilters({
                search: "",
                status: "all",
                day: "all",
                sense: "all",
                minLevel: "",
              });
              setSortConfig(null);
            }}
            className="h-12 w-full rounded-2xl bg-slate-100 px-6 text-sm font-medium text-slate-700 transition hover:bg-slate-200 sm:ml-auto sm:w-auto"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <DashboardStat title="Total Devices" value={stats.total} />
          <DashboardStat
            title="Connected"
            value={stats.connected}
            tone="text-emerald-600"
          />
          <DashboardStat
            title="Sleeping"
            value={stats.sleeping}
            tone="text-sky-600"
          />
          <DashboardStat
            title="Offline"
            value={stats.offline}
            tone="text-rose-600"
          />
          <DashboardStat title="Avg Battery" value={`${stats.avgBattery}%`} />
          <DashboardStat title="Avg Tank" value={`${stats.avgTank}%`} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-800">Devices</h2>
            <p className="text-xs text-slate-400">
              {filteredDevices.length} results
            </p>
          </div>
          <div className="max-h-[560px] overflow-auto">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <SortableHeader
                    label="Serial"
                    sortKey="serialNumber"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Phone"
                    sortKey="phoneNumber"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Day"
                    sortKey="day"
                    sortConfig={null}
                    onSort={() => undefined}
                  />
                  <SortableHeader
                    label="Sense"
                    sortKey="sense"
                    sortConfig={null}
                    onSort={() => undefined}
                  />
                  <SortableHeader
                    label="Tank"
                    sortKey="tankVolume"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Battery"
                    sortKey="batteryAmount"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Status"
                    sortKey="deviceStatus"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Created"
                    sortKey="creationDatetime"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center text-slate-400"
                    >
                      Loading devices…
                    </td>
                  </tr>
                ) : filteredDevices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center text-slate-400"
                    >
                      No devices match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((device) => {
                    const status = statusLabel(device.deviceStatus);
                    const hasLocation = Boolean(parseLocation(device.location));
                    return (
                      <tr
                        key={device.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-emerald-700">
                          <button
                            className="hover:underline"
                            onClick={() => handleOpenDetails(device)}
                          >
                            {device.serialNumber}
                          </button>
                        </td>
                        <td className="px-6 py-4">{device.phoneNumber}</td>
                        <td className="px-6 py-4">{device.day ?? "—"}</td>
                        <td className="px-6 py-4">{device.sense ?? "—"}</td>
                        <td className="px-6 py-4 text-slate-700">
                          <div className="flex items-center gap-3">
                            <BucketIcon bucketAmount={device.tankVolume} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <BatteryIcon batteryAmount={device.batteryAmount} />
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge ${status.tone} inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold`}
                          >
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDateTime(device.creationDatetime)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
                            {hasLocation && (
                              <button
                                className="text-emerald-600 underline-offset-2 hover:underline"
                                onClick={() => handleLocate(device)}
                              >
                                Locate
                              </button>
                            )}
                            <button
                              className="text-slate-600 underline-offset-2 hover:underline"
                              onClick={() => {
                                setPreviewDevice(device);
                              }}
                            >
                              Quick view
                            </button>
                            <button
                              className="text-rose-600 underline-offset-2 hover:underline"
                              onClick={() => {
                                setDeleteCandidate(device);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Map</h2>
            <p className="text-xs text-slate-400">Locate active devices</p>
          </div>
          <div className="relative mt-4 h-[320px] overflow-hidden rounded-2xl border border-emerald-50 md:h-[520px]">
            {mapDevices.length > 0 ? (
              <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={false}
                className="leaflet-map h-full w-full"
                style={{ zIndex: 0 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                />
                {mapDevices.map((device) => {
                  const location = parseLocation(device.location);
                  if (!location) return null;
                  return (
                    <Marker
                      key={device.id}
                      position={location}
                      icon={customIcon}
                    />
                  );
                })}
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-400">
                No location data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholderSection = (title: string) => (
    <div className="rounded-3xl bg-white p-10 text-center shadow-card">
      <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">
        This section is under construction. Stay tuned!
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-500 pb-16">
      <header className="gwm-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
                <img
                  src="/Logo-site.png"
                  alt="Smart Oil Meter Pro"
                  className="h-14 w-14"
                />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Smart Oil Meter Pro
                </h1>
                <p className="text-sm text-white/75">
                  Unified Portal v2 &mdash; Operations dashboard
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-1 flex-col gap-3 md:mt-0 md:items-end">
              <div className="w-full rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
                  <span>Tank Capacity (%)</span>
                  <span>{stats.avgTank}% avg</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${stats.avgTank}%` }}
                  />
                </div>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white/95 shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                activeSection === tab.id
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto mt-8 max-w-7xl space-y-6 px-4">
        {activeSection === "dashboard" && renderDashboardSection()}
        {activeSection === "device-details" &&
          renderPlaceholderSection("Device Details & History")}
        {activeSection === "maintenance" &&
          renderPlaceholderSection("Maintenance Logs")}
        {activeSection === "calibration" &&
          renderPlaceholderSection("Calibration & AI Analytics")}
        {activeSection === "notifications" &&
          renderPlaceholderSection("Smart Notification Centre")}
        {activeSection === "live" &&
          renderPlaceholderSection("Live Monitoring & Map")}
      </main>

      {previewDevice && (
        <aside className="fixed bottom-6 right-6 z-40 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {previewDevice.serialNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Phone: {previewDevice.phoneNumber}
              </p>
            </div>
            <button
              className="ml-auto text-slate-400 hover:text-slate-600"
              onClick={() => setPreviewDevice(null)}
              aria-label="Close quick view"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <QuickMetric
              label="Tank level"
              value={`${previewDevice.tankVolume}%`}
            />
            <QuickMetric
              label="Battery"
              value={`${Math.round(
                toBatteryPercentage(previewDevice.batteryAmount)
              )}%`}
            />
            <QuickMetric
              label="Status"
              value={statusLabel(previewDevice.deviceStatus).label}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              onClick={() => handleOpenDetails(previewDevice)}
            >
              View details
            </button>
            {previewLocation && (
              <button
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                onClick={() => handleLocate(previewDevice)}
              >
                Locate
              </button>
            )}
          </div>
        </aside>
      )}

      {showDetailsModal && selectedDevice && (
        <ModalShell onClose={handleCloseDetails} title="Device history">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Serial
                </p>
                <p className="font-semibold text-slate-800">
                  {selectedDevice.serialNumber}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Phone
                </p>
                <p>{selectedDevice.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Created
                </p>
                <p>{formatDateTime(selectedDevice.creationDatetime)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">
                  Recent datapoints
                </span>{" "}
                (page {pageNumber})
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="page-size" className="text-slate-500">
                  Page size
                </label>
                <select
                  id="page-size"
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                >
                  {[5, 10, 20].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="max-h-[400px] overflow-auto rounded-2xl border border-slate-100">
              <table className="min-w-full text-sm text-slate-600">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Tank volume
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Battery
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detailsLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-16 text-center text-slate-400"
                      >
                        Loading history…
                      </td>
                    </tr>
                  ) : deviceDetails.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-16 text-center text-slate-400"
                      >
                        No datapoints found for this device.
                      </td>
                    </tr>
                  ) : (
                    deviceDetails.map((detail) => (
                      <tr
                        key={detail.id}
                        className="border-b border-slate-100 last:border-none"
                      >
                        <td className="px-4 py-3">
                          {formatDateTime(detail.creationDatetime)}
                        </td>
                        <td className="px-4 py-3">{detail.tankVolume}%</td>
                        <td className="px-4 py-3">
                          {Math.round(
                            toBatteryPercentage(detail.batteryAmount)
                          )}
                          %
                        </td>
                        <td className="px-4 py-3">
                          {statusLabel(detail.deviceStatus).label}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
                disabled={pageNumber === 1}
              >
                Previous
              </button>
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setPageNumber((value) => value + 1)}
                disabled={deviceDetails.length < pageSize}
              >
                Next
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {showDeleteModal && deleteCandidate && (
        <ModalShell
          onClose={() => setShowDeleteModal(false)}
          title="Delete device"
        >
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Are you sure you want to remove device{" "}
              <span className="font-semibold text-slate-800">
                {deleteCandidate.serialNumber}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {showMapModal && selectedDevice && mapLocation && (
        <ModalShell
          onClose={() => setShowMapModal(false)}
          title={`${selectedDevice.serialNumber} location`}
        >
          <div className="h-[420px] overflow-hidden rounded-2xl border border-emerald-100">
            <MapContainer
              center={mapLocation}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={mapLocation} icon={customIcon} />
            </MapContainer>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

const DashboardStat: React.FC<{
  title: string;
  value: number | string;
  tone?: string;
}> = ({ title, value, tone }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
    <p className={`mt-2 text-2xl font-semibold ${tone ?? "text-slate-800"}`}>
      {value}
    </p>
  </div>
);

const QuickMetric: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="rounded-2xl bg-slate-50 p-3 text-slate-600">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 font-semibold text-slate-800">{value}</p>
  </div>
);

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortKey | "day" | "sense";
  sortConfig: { key: SortKey; direction: "asc" | "desc" } | null;
  onSort: (key: SortKey) => void;
}> = ({ label, sortKey, sortConfig, onSort }) => {
  const isActive = sortConfig?.key === sortKey;
  const icon =
    sortConfig && isActive ? (sortConfig.direction === "asc" ? "▲" : "▼") : "▾";

  const isSortable = sortKey !== "day" && sortKey !== "sense";

  return (
    <th className="px-6 py-3 text-left font-semibold">
      {isSortable ? (
        <button
          className={`flex items-center gap-2 text-xs uppercase tracking-wide transition ${
            isActive ? "text-emerald-600" : "text-slate-400"
          }`}
          onClick={() => onSort(sortKey as SortKey)}
        >
          {label}
          <span className="text-[10px]">{icon}</span>
        </button>
      ) : (
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </span>
      )}
    </th>
  );
};

const ModalShell: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur">
    <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <button
          onClick={onClose}
          className="text-slate-400 transition hover:text-slate-600"
          aria-label="Close modal"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  </div>
);

export default HomePage;
