import React, { useEffect, useState } from "react";
import { fetchData, fetchItemDetails, deleteBucket } from "../services/api";
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
  IconButton,
  VStack,
  HStack,
  Divider,
  // Progress,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

const HomePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemDetails, setItemDetails] = useState<any[]>([]);
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

  const handleDeleteClick = (id: number) => {
    setBucketToDelete(id);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (bucketToDelete !== null) {
      await deleteBucket(bucketToDelete, token);
      setBucketToDelete(null);
      onDeleteClose();
      // Refresh data after deletion
      const result = await fetchData(token);
      if (result && result.value && result.value.response) {
        setData(result.value.response);
      }
    }
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
      justify="flex-start"
      minH="100vh"
      bgGradient="linear(to-br, teal.400, blue.500)"
      p={6}
      color="white"
    >
      <Box maxW="6xl" w="100%" mb={8} textAlign="center">
        <Heading size="xl" mb={4}>
          Welcome to GWM
        </Heading>
        <Heading size="md" fontWeight="normal">
          Smart Oil Meter Pro Panel
        </Heading>
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
                    Serial Number: {item.serialNumber}
                  </Text>
                  <IconButton
                    aria-label="Delete bucket"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteClick(item.id)}
                  />
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
              <Text>Nothing!</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal تایید حذف */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Confirmation</ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to delete this bucket?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteConfirm}>
              Yes
            </Button>
            <Button variant="ghost" onClick={onDeleteClose}>
              No
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default HomePage;
