import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Box,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { login as loginService } from "../services/api";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
  onLogin: (token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // برای ذخیره پیام خطا
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await loginService(username, password);
    if (result.token) {
      onLogin(result.token);
      navigate("/home");
    } else if (result.message) {
      setErrorMessage(result.message); // نمایش پیام خطا
    }
  };

  return (
    <Flex
      align="center"
      justify="center"
      h="100vh"
      bgGradient="linear(to-r, teal.400, blue.500)"
    >
      <Box
        p={8}
        maxWidth="400px"
        width="100%"
        bg="white"
        boxShadow="lg"
        rounded="lg"
      >
        <Stack spacing={4}>
          <Heading as="h2" size="lg" textAlign="center" mb={6}>
            Login
          </Heading>
          <form onSubmit={handleSubmit}>
            <FormControl id="username" mb="4" isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <FormControl id="password" mb="4" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            {errorMessage && (
              <Text color="red.500" mt={2}>
                {errorMessage}
              </Text>
            )}
            <Button type="submit" colorScheme="teal" width="full" mt={4}>
              Login
            </Button>
          </form>
        </Stack>
      </Box>
    </Flex>
  );
};

export default LoginPage;
