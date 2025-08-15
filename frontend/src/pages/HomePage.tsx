import { Container, Text, Stack, Button, Card, SimpleGrid, Avatar, Title } from '@mantine/core';
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
          >
            Welcome to SwatchX
          </Text>

          <Text 
            size="xl" 
            ta="center" 
            c="dimmed"
          >
            Select a company to manage
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="3rem" w="100%" maw="800px">
            <Card 
              shadow="lg" 
              padding="2rem" 
              radius="xl"
              withBorder
              h={300}
              styles={{
                root: {
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.05)',
                    boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4), 0 15px 35px rgba(0, 0, 0, 0.2)',
                  }
                }
              }}
              onClick={() => handleCompanySelect('Swatch')}
            >
              <Stack align="center" gap="lg" h="100%" justify="center">
                <Avatar
                  size={80}
                  radius="xl"
                  color="blue"
                  styles={{
                    root: {
                      fontSize: '2rem',
                      fontWeight: 700
                    }
                  }}
                >
                  S
                </Avatar>
                <Title order={2} ta="center">Swatch</Title>
                <Button 
                  variant="light" 
                  color="blue" 
                  size="lg" 
                  fullWidth
                  radius="lg"
                >
                  Manage Swatch
                </Button>
              </Stack>
            </Card>
            
            <Card 
              shadow="lg" 
              padding="2rem" 
              radius="xl"
              withBorder
              h={300}
              styles={{
                root: {
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.05)',
                    boxShadow: '0 25px 50px rgba(6, 182, 212, 0.4), 0 15px 35px rgba(0, 0, 0, 0.2)',
                  }
                }
              }}
              onClick={() => handleCompanySelect('SWS')}
            >
              <Stack align="center" gap="lg" h="100%" justify="center">
                <Avatar
                  size={80}
                  radius="xl"
                  color="cyan"
                  styles={{
                    root: {
                      fontSize: '1.5rem',
                      fontWeight: 700
                    }
                  }}
                >
                  SWS
                </Avatar>
                <Title order={2} ta="center">SWS</Title>
                <Button 
                  variant="light" 
                  color="cyan" 
                  size="lg" 
                  fullWidth
                  radius="lg"
                >
                  Manage SWS
                </Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>
    </Layout>
  );
}
