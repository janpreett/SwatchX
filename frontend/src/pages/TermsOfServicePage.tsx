import { Container, Paper, Title, Text, Stack, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';

export function TermsOfServicePage() {
  const themeColors = useThemeColors();
  
  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" radius="md" p="xl">
        <Stack gap="md">
          <Title order={1} mb="lg">Terms of Service</Title>
          
          <Text size="sm" c={themeColors.secondaryText}>Last updated: August 14, 2025</Text>

          <Stack gap="lg">
            <section>
              <Title order={2} size="h3" mb="sm">1. Acceptance of Terms</Title>
              <Text>
                By accessing and using SwatchX Fleet Expense Tracker ("the Service"), you accept and agree 
                to be bound by the terms and provision of this agreement. This is a personal expense tracking 
                application designed for fleet management purposes.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">2. Description of Service</Title>
              <Text>
                SwatchX is a fleet expense tracking application that allows you to:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li>Track expenses for multiple companies (Swatch and SWS)</li>
                <li>Manage truck, trailer, fuel, and other business-related expenses</li>
                <li>Store and organize expense data with optional file attachments</li>
                <li>Generate reports and view expense summaries</li>
                <li>Manage fleet assets including trucks, trailers, and business units</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">3. User Accounts and Registration</Title>
              <Text>
                To use certain features of the Service, you must register for an account. You agree to:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li>Provide accurate, complete, and current information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">4. Data and Privacy</Title>
              <Text>
                This is a business application designed for company fleet expense management. We collect and store:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li>Account information (email address and encrypted password)</li>
                <li>Company expense data (dates, amounts, descriptions, categories)</li>
                <li>Fleet management data (truck numbers, trailer numbers, business units)</li>
                <li>Optional file attachments (receipts, invoices, documentation)</li>
              </Text>
              <Text mt="sm">
                <strong>Important:</strong> Company expense data belongs to the business entity (Swatch or SWS) and is 
                preserved for business purposes. When you delete your account, only your user account is removed. 
                Company expense data, fleet information, and business records remain intact and accessible to other 
                authorized users of the company.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">5. Data Retention and Deletion</Title>
              <Text>
                As this is a business application for company expense management:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li>You can delete individual expense records you created (subject to company policies)</li>
                <li>You can request deletion of your user account</li>
                <li><strong>Company expense data is NOT deleted when you delete your account</strong></li>
                <li>Company data belongs to the business entity and is preserved for business continuity</li>
                <li>Fleet information, service providers, and business records remain accessible to other users</li>
                <li>Backup and export features are available for company data preservation</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">6. Acceptable Use</Title>
              <Text>
                You agree to use the Service only for legitimate fleet expense tracking purposes. 
                Prohibited activities include:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li>Using the Service for any illegal or unauthorized purpose</li>
                <li>Attempting to gain unauthorized access to other users' data</li>
                <li>Uploading malicious files or content</li>
                <li>Interfering with the proper functioning of the Service</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">7. Intellectual Property</Title>
              <Text>
                The Service and its original content, features, and functionality are owned by the 
                application developer and are protected by copyright, trademark, and other intellectual 
                property laws. You retain ownership of the data you input into the system.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">8. Limitation of Liability</Title>
              <Text>
                This is a personal application provided "as is" without warranties of any kind. 
                The developer shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including data loss, even if advised of the possibility of such damages.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">9. Service Modifications</Title>
              <Text>
                We reserve the right to modify or discontinue the Service with or without notice. 
                We may also modify these terms at any time, and continued use of the Service 
                constitutes acceptance of the modified terms.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">10. Termination</Title>
              <Text>
                You may terminate your account at any time by contacting us or using the account 
                deletion feature when available. We may terminate accounts that violate these terms 
                or for any other reason at our discretion.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">11. Contact Information</Title>
              <Text>
                For questions about these Terms of Service, please contact the application administrator. 
                This is a personal application, and support may be limited.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">12. Governing Law</Title>
              <Text>
                These terms shall be governed by and construed in accordance with applicable local laws. 
                Any disputes shall be resolved through appropriate legal channels in the jurisdiction 
                where the service is operated.
              </Text>
            </section>
          </Stack>

          <Text ta="center" mt="xl">
            <Anchor component={Link} to="/home" size="sm">
              ← Return to Application
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
