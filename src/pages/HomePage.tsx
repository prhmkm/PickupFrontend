import React, { useEffect, useState } from "react";
import { fetchData, fetchItemDetails } from "../services/api";
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
  Stack,
  Select,
} from "@chakra-ui/react";

const HomePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemDetails, setItemDetails] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState<number>(10); // تعداد آیتم‌ها در هر صفحه
  const [pageNumber, setPageNumber] = useState<number>(1); // شماره صفحه فعلی
  const token = localStorage.getItem("token") || "";
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        }
      };
      fetchDetails();
    }
  }, [selectedItem, pageSize, pageNumber, token]);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    onOpen();
  };

  function changePageNumber(value: string) {
    const newPageNumber = parseInt(value);
    setPageNumber(newPageNumber);
  }

  function changePageSize(value: string) {
    const newPageSize = parseInt(value);
    setPageSize(newPageSize);
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="100vh"
      bgGradient="linear(to-br, blue.300, purple.500)"
      p={6}
    >
      <Box maxW="6xl" w="100%">
        <Heading mb="6" color="white" textAlign="center">
          Active Buckets
        </Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {data.map((item) => (
            <GridItem
              key={item.id}
              p={4}
              bg="white"
              borderRadius="md"
              boxShadow="lg"
              cursor="pointer"
              onClick={() => handleItemClick(item)}
            >
              <Stack spacing={2}>
                <Text fontWeight="bold">
                  Serial Number: {item.serialNumber}
                </Text>
                <Text>
                  Creation Date:{" "}
                  {new Date(item.creationDatetime).toLocaleString()}
                </Text>
              </Stack>
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* Popup برای نمایش جزئیات */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Item Details</ModalHeader>
          <ModalBody>
            <Flex mb={4} align="center">
              <Select
                value={pageSize}
                onChange={(e) => changePageSize(e.target.value)}
                mr={4}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </Select>
              <Text mr={2}>Page Size</Text>

              <Select
                value={pageNumber}
                onChange={(e) => changePageNumber(e.target.value)}
                ml={4}
              >
                {pageNumber === 1 ? null : (
                  <option value={pageNumber - 1}>{pageNumber - 1}</option>
                )}
                <option value={pageNumber}>{pageNumber}</option>
                <option value={pageNumber + 1}>{pageNumber + 1}</option>
                <option value={pageNumber + 2}>{pageNumber + 2}</option>
              </Select>
              <Text ml={2}>Page Number</Text>
            </Flex>
            {itemDetails.length > 0 ? (
              <Stack spacing={4}>
                {itemDetails.map((detail) => (
                  <Box
                    key={detail.id}
                    p={4}
                    bg="gray.100"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Text>
                      <strong>ID:</strong> {detail.id}
                    </Text>
                    <Text>
                      <strong>Serial Number:</strong> {detail.serialNumber}
                    </Text>
                    <Text>
                      <strong>Battery Amount:</strong> {detail.batteryAmount}
                    </Text>
                    <Text>
                      <strong>Device Status:</strong> {detail.deviceStatus}
                    </Text>
                    <Text>
                      <strong>Tank Volume:</strong> {detail.tankVolume}
                    </Text>
                    <Text>
                      <strong>Creation Date:</strong>{" "}
                      {new Date(detail.creationDatetime).toLocaleString()}
                    </Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text>Loading...</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default HomePage;
