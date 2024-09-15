import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Flex,
  Select,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  IconButton,
  Divider,
  ModalCloseButton,
} from "@chakra-ui/react";
import { deleteBucket, fetchData, fetchItemDetails } from "../services/api";
import { DeleteIcon, WarningTwoIcon } from "@chakra-ui/icons";
import BatteryIcon from "../components/BatteryIcon";
import BucketIcon from "../components/BucketIcon";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41], // اندازه آیکون
  iconAnchor: [12, 41], // نقطه‌ای که آیکون به آن اشاره می‌کند
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const HomePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [doFetch, setDoFetch] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemDetails, setItemDetails] = useState<any[]>([]);
  const [Location, setLocation] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(5);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [bucketToDelete, setBucketToDelete] = useState<number | null>(null);
  const token = localStorage.getItem("token") || "";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isLocateOpen,
    onOpen: onLocateOpen,
    onClose: onLocateClose,
  } = useDisclosure();

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData(token);
      if (result && result.value && result.value.response) {
        setData(result.value.response);
      }
    };
    loadData();
  }, [token]);

  useEffect(() => {
    if (selectedItem) {
      const fetchDetails = async () => {
        const details = await fetchItemDetails(
          selectedItem.id,
          token,
          pageSize,
          pageNumber
        );
        if (details && details.value && details.value.response) {
          setItemDetails(details.value.response);
          // setItemDetailsMax(details.value.max);
        }
      };
      fetchDetails();
    }
  }, [selectedItem, pageSize, pageNumber, token, doFetch]);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDoFetch(!doFetch);
    onOpen();
  };

  const handleDeleteClick = (id: number) => {
    setBucketToDelete(id);
    onDeleteOpen();
  };

  const handleLocateClick = (loc: string, item: any) => {
    setSelectedItem(item);
    setLocation([loc.split(",")[0], loc.split(",")[1]]);
    onLocateOpen();
  };

  const handleDeleteConfirm = async () => {
    if (bucketToDelete !== null) {
      await deleteBucket(bucketToDelete, token);
      setBucketToDelete(null);
      onDeleteClose();
      const result = await fetchData(token);
      if (result && result.value && result.value.response) {
        setData(result.value.response);
      }
    }
  };

  const resetModal = () => {
    setPageSize(5);
    setPageNumber(1);
    setItemDetails([]);
    // setItemDetailsMax(0);
    onClose();
  };

  const resetLocateModal = () => {
    setLocation([]);
    onLocateClose();
  };

  const changePageNumber = (value: number) => {
    setPageNumber(value);
    console.log(pageNumber);
    setItemDetails([]);
  };

  const changePageSize = (value: string) => {
    setPageSize(parseInt(value));
    console.log(pageSize);
    setItemDetails([]);
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="100vh"
      bgGradient="linear(to-br, teal.400, blue.500)"
      p={6}
      color="white"
    >
      <Box maxW="6xl" w="100%" mb={8} textAlign="center">
        <Heading size="xl" mb={4}>
          <Flex alignItems="center" justifyContent="center">
            Welcome to Smart Oil Meter Pro Panel
            <img
              src="\Logo-site.png"
              alt="Logo"
              style={{ width: "50px", height: "50px" }}
            />
          </Flex>
        </Heading>
        <Flex alignItems="center" justifyContent="center">
          <Heading size="md" fontWeight="normal" mr={4}>
            German Waste Managment GmbH
          </Heading>
        </Flex>
      </Box>

      <Box maxW="6xl" w="100%">
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {data.map((item) => (
            <GridItem
              key={item.id}
              p={4}
              bg="white"
              borderRadius="md"
              boxShadow="lg"
              position="relative"
              _hover={{ boxShadow: "2xl" }}
            >
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="lg" fontWeight="bold" color="gray.700">
                    Serial Number : {item.serialNumber}
                  </Text>
                  <IconButton
                    aria-label="Delete bucket"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteClick(item.id)}
                  />
                </HStack>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color="teal.600"
                  as="abbr"
                >
                  Phone Number : {item.phoneNumber}
                </Text>
                <Divider />

                <HStack justify="space-between" w="100%">
                  {item.deviceStatus == 1 ? (
                    <Text fontSize="lg" fontWeight="bold" color="green.400">
                      Connected!
                    </Text>
                  ) : (
                    <Text fontSize="lg" fontWeight="bold" color="red.600">
                      Disconnected! <WarningTwoIcon marginTop={"-4px"} />
                    </Text>
                  )}{" "}
                  {/* فاصله بیشتر بین آیکون باطری و سطل */}
                  <Flex alignItems="center" justify="space-between" gap="2">
                    {item.location ? (
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleLocateClick(item.location, item)}
                      >
                        Locate
                      </Button>
                    ) : null}
                  </Flex>
                </HStack>

                <HStack justify="space-between" w="100%">
                  <Text fontSize="lg" fontWeight="bold" color="gray.700">
                    Battery :{" "}
                  </Text>
                  {/* فاصله بیشتر بین آیکون باطری و سطل */}
                  <Flex alignItems="center" justify="space-between" gap="2">
                    <BatteryIcon batteryAmount={item.batteryAmount} />
                  </Flex>
                </HStack>

                <HStack justify="space-between" w="100%">
                  <Text fontSize="lg" fontWeight="bold" color="gray.700">
                    Tank ({item.bucketHeight} cm) :{" "}
                  </Text>
                  <Flex alignItems="center" justify="space-between" gap="2">
                    <BucketIcon bucketAmount={item.tankVolume} />
                  </Flex>
                </HStack>

                <Divider />
                <Text color="gray.600">
                  Creation Date:{" "}
                  {new Date(item.creationDatetime).toLocaleString()}
                </Text>
                <Button
                  size="sm"
                  colorScheme="teal"
                  onClick={() => handleItemClick(item)}
                >
                  View Details
                </Button>
              </VStack>
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* View Details Modal */}
      <Modal isOpen={isOpen} onClose={resetModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Item Details</ModalHeader>
          <ModalBody>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">
                Details for {selectedItem?.serialNumber}
              </Heading>
              <Select
                value={pageSize}
                onChange={(e) => changePageSize(e.target.value)}
                size="sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </Select>
            </Flex>

            {itemDetails.length === 0 ? (
              <Text textAlign="center" color="gray.500" fontStyle="italic">
                Nothing...
              </Text>
            ) : (
              <Accordion defaultIndex={[0]} allowMultiple>
                {itemDetails.map((detail) => (
                  <AccordionItem key={detail.id}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          {/* نمایش creationDatetime و tankVolume به جای serialNumber */}
                          <Text fontWeight="bold">
                            Creation Date:{" "}
                            {new Date(detail.creationDatetime).toLocaleString()}
                          </Text>
                          {/* <Text>Tank Volume: {detail.tankVolume}</Text> */}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Text>
                        <strong>ID:</strong> {detail.id}
                      </Text>
                      <Text>
                        <strong>Battery Amount:</strong> {detail.batteryAmount}
                      </Text>
                      <Text>
                        <strong>Device Status:</strong> {detail.deviceStatus}
                      </Text>
                      <Text>
                        <strong>Tank Volume:</strong> {detail.tankVolume}{" "}
                      </Text>
                      <Text>
                        <strong>Creation Date:</strong>{" "}
                        {new Date(detail.creationDatetime).toLocaleString()}
                      </Text>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            <Flex mt={4} justify="center">
              <Button
                onClick={() => changePageNumber(Math.max(1, pageNumber - 1))}
                mr={2}
                isDisabled={pageNumber == 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => changePageNumber(pageNumber + 1)}
                ml={2}
                isDisabled={itemDetails.length < pageSize}
              >
                Next
              </Button>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={resetModal} colorScheme="teal">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Confirmation</ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to delete this bucket?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleDeleteConfirm} mr={3}>
              Delete
            </Button>
            <Button variant="ghost" onClick={onDeleteClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Locate Confirmation Modal */}
      <Modal isOpen={isLocateOpen} onClose={onLocateClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedItem?.serialNumber} device location
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MapContainer
              center={[Number(Location[0]), Number(Location[1])]}
              zoom={13}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
              />
              <Marker
                position={[Number(Location[0]), Number(Location[1])]}
                icon={customIcon}
              />
            </MapContainer>
          </ModalBody>

          <ModalFooter>
            <Button onClick={resetLocateModal} colorScheme="teal">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default HomePage;
