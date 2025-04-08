import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Flex,
  Input,
  Select,
  Button,
  Text,
  Badge,
  Spinner,
  HStack,
  useToast,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

// Interface for Registration data
interface BaseRegistration {
  id: number;
  gender: string;
  jis_id: string;
  mobile: string;
  email: string;
  department: string;
  registration_date: string;
  payment_status: string;
  receipt_number: string;
  payment_updated_by: string;
  payment_update_timestamp: string;
  paid_amount: string;
  ticket_generated: string;
  checkin_1: string;
  checkin_1_timestamp: string | null;
  checkin_2: string;
  checkin_2_timestamp: string | null;
  edited_by: string | null;
  edited_timestamp: string | null;
  registration_type: 'student' | 'alumni';
}

interface StudentRegistration extends BaseRegistration {
  student_name: string;
  inhouse_competition: string;
  competition_name: string;
}

interface AlumniRegistration extends BaseRegistration {
  alumni_name: string;
  student_name: string; // For compatibility with shared components
  passout_year: string;
  current_organization: string;
}

type Registration = StudentRegistration | AlumniRegistration;

const Registrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const toast = useToast();

  // Fetch registrations from the backend
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        
        // Get the current URL to determine the correct API endpoint
        const currentUrl = window.location.origin;
        const apiBaseUrl = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1') 
          ? 'http://localhost:3000' 
          : currentUrl;
        
        console.log('Fetching registrations from:', `${apiBaseUrl}/api/registrations`);
        
        const response = await axios.get(`${apiBaseUrl}/api/registrations`);
        console.log('Registration data retrieved successfully');
        console.log('Total records:', response.data?.length || 0);
        
        // Log breakdown of registration types
        if (Array.isArray(response.data)) {
          const studentCount = response.data.filter(r => r.registration_type === 'student').length;
          const alumniCount = response.data.filter(r => r.registration_type === 'alumni').length;
          console.log(`Records by type: ${studentCount} students, ${alumniCount} alumni`);
        }
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          // The registration_type field is added by the server to indicate source table
          setRegistrations(response.data);
          setFilteredRegistrations(response.data);
        } else {
          setError('No registration data found in the database');
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching registrations:', err);
        const errorMessage = err.response ? 
          `Server error: ${err.response.status} - ${err.response.statusText}` : 
          `Network error: ${err.message}`;
          
        setError(`Failed to fetch registrations data: ${errorMessage}`);
        setLoading(false);
        
        toast({
          title: 'Error fetching data',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchRegistrations();
  }, [toast]);

  // Filter registrations based on search and filter values
  useEffect(() => {
    let result = [...registrations];
    
    // Filter by registration type (student or alumni)
    if (filterType) {
      result = result.filter((reg) => reg.registration_type === filterType);
    }
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (reg) => {
          const nameField = 'alumni_name' in reg ? reg.alumni_name : reg.student_name;
          return nameField.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.jis_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.mobile.includes(searchTerm);
        }
      );
    }
    
    // Filter by department
    if (filterDepartment) {
      result = result.filter((reg) => reg.department === filterDepartment);
    }
    
    // Filter by payment status
    if (filterPayment) {
      result = result.filter((reg) => reg.payment_status === filterPayment);
    }
    
    setFilteredRegistrations(result);
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterPayment, filterType, registrations]);

  // Get unique departments for filter dropdown
  const departments = [...new Set(registrations.map((reg) => reg.department))];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" height="80vh" direction="column" gap={4}>
        <Text color="red.500" fontSize="xl">{error}</Text>
        <Button colorScheme="blue" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Flex>
    );
  }

  return (
    <Box p={5}>
      <Heading size="lg" mb={6}>Registrations</Heading>
      
      {/* Filters */}
      <Flex mb={6} flexWrap="wrap" gap={4}>
        <Box flex="1" minW="200px">
          <Input
            placeholder="Search by name, ID, email, or mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <Box minW="150px">
          <Select 
            placeholder="Filter by Department" 
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </Select>
        </Box>
        <Box minW="150px">
          <Select 
            placeholder="Payment Status" 
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="">All</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </Select>
        </Box>
        <Box minW="150px">
          <Select 
            placeholder="Registration Type" 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </Select>
        </Box>
      </Flex>
      
      {/* Results count */}
      <Text mb={4}>
        Showing {currentItems.length} of {filteredRegistrations.length} registrations
      </Text>
      
      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Type</Th>
              <Th>Name</Th>
              <Th>JIS ID</Th>
              <Th>Department</Th>
              <Th>Mobile</Th>
              <Th>Details</Th>
              <Th>Payment</Th>
              <Th>Amount</Th>
              <Th>Ticket</Th>
              <Th>Check-in</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.length > 0 ? (
              currentItems.map((reg) => (
                <Tr key={reg.id}>
                  <Td>{reg.id}</Td>
                  <Td>
                    <Badge colorScheme={reg.registration_type === 'alumni' ? 'purple' : 'blue'}>
                      {reg.registration_type === 'alumni' ? 'Alumni' : 'Student'}
                    </Badge>
                  </Td>
                  <Td>
                    {'alumni_name' in reg ? reg.alumni_name : reg.student_name}
                  </Td>
                  <Td>{reg.jis_id}</Td>
                  <Td>{reg.department}</Td>
                  <Td>{reg.mobile}</Td>
                  <Td>
                    {reg.registration_type === 'alumni' ? 
                      `${(reg as AlumniRegistration).passout_year} - ${(reg as AlumniRegistration).current_organization}` : 
                      (reg as StudentRegistration).competition_name
                    }
                  </Td>
                  <Td>
                    <Badge colorScheme={reg.payment_status === 'Paid' ? 'green' : 'red'}>
                      {reg.payment_status}
                    </Badge>
                  </Td>
                  <Td>{reg.paid_amount}</Td>
                  <Td>
                    <Badge colorScheme={reg.ticket_generated === 'Yes' ? 'green' : 'gray'}>
                      {reg.ticket_generated === 'Yes' ? 'Yes' : 'No'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={reg.checkin_1 === 'Yes' ? 'green' : 'gray'}>
                      {reg.checkin_1 === 'Yes' ? '1' : '0'}
                    </Badge>
                    {' / '}
                    <Badge colorScheme={reg.checkin_2 === 'Yes' ? 'green' : 'gray'}>
                      {reg.checkin_2 === 'Yes' ? '2' : '0'}
                    </Badge>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={11} textAlign="center">No registrations found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* Pagination */}
      <Flex justify="center" mt={6}>
        <HStack>
          <Button
            leftIcon={<ChevronLeftIcon />}
            onClick={() => setCurrentPage(currentPage - 1)}
            isDisabled={currentPage === 1}
            size="sm"
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages || 1}
          </Text>
          <Button
            rightIcon={<ChevronRightIcon />}
            onClick={() => setCurrentPage(currentPage + 1)}
            isDisabled={currentPage === totalPages || totalPages === 0}
            size="sm"
          >
            Next
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Registrations;
