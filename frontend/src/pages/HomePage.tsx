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
                  transformStyle: 'preserve-3d',
                  '&:hover': {
                    transform: 'translateY(-12px) rotateX(5deg) scale(1.05)',
                    boxShadow: `
                      0 25px 50px rgba(59, 130, 246, 0.4),
                      0 15px 35px rgba(0, 0, 0, 0.2),
                      0 5px 15px rgba(59, 130, 246, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                    borderColor: 'var(--mantine-color-blue-4)',
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
                      fontWeight: 700,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotateY(10deg)',
                        filter: 'brightness(1.1)'
                      }
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
                  styles={{
                    root: {
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        filter: 'brightness(1.1)'
                      }
                    }
                  }}
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
                  transformStyle: 'preserve-3d',
                  '&:hover': {
                    transform: 'translateY(-12px) rotateX(5deg) scale(1.05)',
                    boxShadow: `
                      0 25px 50px rgba(6, 182, 212, 0.4),
                      0 15px 35px rgba(0, 0, 0, 0.2),
                      0 5px 15px rgba(6, 182, 212, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                    borderColor: 'var(--mantine-color-cyan-4)',
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
                      fontWeight: 700,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotateY(10deg)',
                        filter: 'brightness(1.1)'
                      }
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
                  styles={{
                    root: {
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        filter: 'brightness(1.1)'
                      }
                    }
                  }}
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
