import { Container, Text, Stack, Button, Card, Group, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useCompany } from '../hooks/useCompany';
import type { Company } from '../contexts/CompanyContext';

export function HomePage() {
  const navigate = useNavigate();
  const { setSelectedCompany } = useCompany();

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    navigate('/dashboard');
  };

  return (
    <Layout>
      <Container size="md" py={{ base: 'xl', sm: '4rem' }}>
        <Stack gap="3rem" align="center">
          <Text 
            size="3rem"
            ta="center" 
            fw={700}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            mb="lg"
          >
            Welcome to SwatchX
          </Text>

          <Text 
            size="xl" 
            ta="center" 
            c="dimmed"
            mb="2rem"
          >
            Select a company to manage
          </Text>

          <Group gap="2rem" justify="center" w="100%">
            <Card 
              shadow="md" 
              padding="2rem" 
              radius="lg"
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
              styles={{
                root: {
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }
              }}
              onClick={() => handleCompanySelect('Swatch')}
              w={{ base: '100%', sm: '300px' }}
            >
              <Stack align="center" gap="lg">
                <Box
                  w={80}
                  h={80}
                  bg="blue.6"
                  style={{
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text size="2rem" fw={700} c="white">S</Text>
                </Box>
                <Text size="2rem" fw={600} ta="center">Swatch</Text>
                <Button 
                  variant="light" 
                  color="blue" 
                  size="lg" 
                  fullWidth
                  radius="md"
                >
                  Manage Swatch
                </Button>
              </Stack>
            </Card>

            <Card 
              shadow="md" 
              padding="2rem" 
              radius="lg"
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
              styles={{
                root: {
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }
              }}
              onClick={() => handleCompanySelect('SWS')}
              w={{ base: '100%', sm: '300px' }}
            >
              <Stack align="center" gap="lg">
                <Box
                  w={80}
                  h={80}
                  bg="cyan.6"
                  style={{
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text size="2rem" fw={700} c="white">SWS</Text>
                </Box>
                <Text size="2rem" fw={600} ta="center">SWS</Text>
                <Button 
                  variant="light" 
                  color="cyan" 
                  size="lg" 
                  fullWidth
                  radius="md"
                >
                  Manage SWS
                </Button>
              </Stack>
            </Card>
          </Group>
        </Stack>
      </Container>
    </Layout>
  );
}
