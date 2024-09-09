import React from 'react'
import { Box, Container, Text, Tab, Tabs, TabList, TabPanel, TabPanels } from '@chakra-ui/react'
import Login from '../components/authentication/login.js'
import Signup from '../components/authentication/signup.js'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const HomePage = () => {

  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"))

    if(user) {
        navigate("/chats")
    }
}, [navigate])

  return (
    <Container maxW='xl' centerContent className=''>
      <Box
        display="flex"
        justifyContent={"center"}
        alignItems={"center"}
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize={"4xl"} fontFamily={"Work Sans"}>Chat Application</Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
      <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default HomePage