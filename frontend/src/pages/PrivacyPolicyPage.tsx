import { Container, Paper, Title, Text, Stack, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';

export function PrivacyPolicyPage() {
  const themeColors = useThemeColors();
  
  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" radius="md" p="xl">
        <Stack gap="md">
          <Title order={1} mb="lg">Privacy Policy</Title>
          
          <Text size="sm" c={themeColors.secondaryText}>Last updated: August 14, 2025</Text>

          <Stack gap="lg">
            <section>
              <Title order={2} size="h3" mb="sm">1. Introduction</Title>
              <Text>
                This Privacy Policy describes how SwatchX Fleet Expense Tracker ("we," "our," or "the Service") 
                collects, uses, and protects your personal information. This is a personal application designed 
                for individual fleet expense management, and your privacy is important to us.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">2. Information We Collect</Title>
              
              <Title order={3} size="h4" mt="md" mb="xs">2.1 Account Information</Title>
              <Text component="ul" pl="md">
                <li><strong>Email Address:</strong> Used for account identification and login</li>
                <li><strong>Password:</strong> Stored in encrypted form using industry-standard hashing</li>
                <li><strong>Account Creation Date:</strong> For record-keeping purposes</li>
              </Text>

              <Title order={3} size="h4" mt="md" mb="xs">2.2 Expense Data</Title>
              <Text component="ul" pl="md">
                <li><strong>Expense Records:</strong> Dates, amounts, descriptions, categories</li>
                <li><strong>Company Information:</strong> Selected company (Swatch or SWS)</li>
                <li><strong>Categorized Expenses:</strong> Truck repairs, fuel, tolls, parts, etc.</li>
                <li><strong>Cost Information:</strong> Monetary amounts in USD</li>
                <li><strong>Timestamps:</strong> When records are created and modified</li>
              </Text>

              <Title order={3} size="h4" mt="md" mb="xs">2.3 Fleet Management Data</Title>
              <Text component="ul" pl="md">
                <li><strong>Truck Information:</strong> Truck numbers and associated data</li>
                <li><strong>Trailer Information:</strong> Trailer numbers and details</li>
                <li><strong>Business Units:</strong> Company divisions or departments</li>
                <li><strong>Fuel Stations:</strong> Names and locations of fuel providers</li>
              </Text>

              <Title order={3} size="h4" mt="md" mb="xs">2.4 File Attachments</Title>
              <Text component="ul" pl="md">
                <li><strong>Receipts:</strong> Uploaded receipt images or documents</li>
                <li><strong>Invoices:</strong> Vendor invoices and bills</li>
                <li><strong>Documentation:</strong> Any supporting files you choose to upload</li>
              </Text>

              <Title order={3} size="h4" mt="md" mb="xs">2.5 Technical Information</Title>
              <Text component="ul" pl="md">
                <li><strong>Login Sessions:</strong> Session tokens for maintaining logged-in state</li>
                <li><strong>Application Usage:</strong> Basic usage patterns for system maintenance</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">3. How We Use Your Information</Title>
              <Text>
                Your information is used exclusively for the following purposes:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li><strong>Account Management:</strong> Creating and maintaining your user account</li>
                <li><strong>Authentication:</strong> Verifying your identity when logging in</li>
                <li><strong>Data Storage:</strong> Storing your expense and fleet management data</li>
                <li><strong>Application Functionality:</strong> Providing expense tracking and reporting features</li>
                <li><strong>Data Retrieval:</strong> Displaying your data when you access the application</li>
                <li><strong>System Maintenance:</strong> Ensuring the application functions properly</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">4. Data Storage and Security</Title>
              
              <Title order={3} size="h4" mt="md" mb="xs">4.1 Local Storage</Title>
              <Text>
                All data is stored locally in a SQLite database on the system where the application runs. 
                This ensures your data remains under your direct control.
              </Text>

              <Title order={3} size="h4" mt="md" mb="xs">4.2 Security Measures</Title>
              <Text component="ul" pl="md">
                <li><strong>Password Encryption:</strong> Passwords are hashed using bcrypt</li>
                <li><strong>JWT Tokens:</strong> Secure session management using JSON Web Tokens</li>
                <li><strong>Local Access Only:</strong> Data is not transmitted to external servers</li>
                <li><strong>File Security:</strong> Uploaded attachments are stored securely on the local system</li>
              </Text>

              <Title order={3} size="h4" mt="md" mb="xs">4.3 Data Access</Title>
              <Text>
                Only you have access to your data through your authenticated account. 
                No third parties have access to your personal or business information.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">5. Data Sharing and Third Parties</Title>
              <Text>
                <strong>We do not share your data with third parties.</strong> This is a personal application, 
                and all data remains on your local system. We do not:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li>Sell or rent your personal information</li>
                <li>Share data with external companies or services</li>
                <li>Use your data for advertising or marketing purposes</li>
                <li>Transmit data to remote servers or cloud services</li>
                <li>Provide data to government agencies (except as required by law)</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">6. Your Rights and Data Control</Title>
              
              <Title order={3} size="h4" mt="md" mb="xs">6.1 Access Rights</Title>
              <Text component="ul" pl="md">
                <li><strong>View Data:</strong> Access all your stored information through the application</li>
                <li><strong>Export Data:</strong> Download your data in standard formats (when available)</li>
                <li><strong>Modify Data:</strong> Edit or update any of your expense or fleet records</li>
              </Text>

              <Title order={3} size="h4" mt="md" mb="xs">6.2 Deletion Rights</Title>
              <Text component="ul" pl="md">
                <li><strong>Individual Records:</strong> Delete specific expense entries at any time</li>
                <li><strong>Bulk Deletion:</strong> Remove multiple records simultaneously</li>
                <li><strong>Complete Account Deletion:</strong> Request full account and data removal</li>
                <li><strong>File Removal:</strong> Delete uploaded attachments and documents</li>
              </Text>

              <Title order={3} size="h4" mt="md" mb="xs">6.3 Data Portability</Title>
              <Text>
                You can request your data in a structured, commonly used format for transfer 
                to other applications or systems.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">7. Data Retention</Title>
              <Text>
                We retain your data for as long as your account is active or as needed to provide services. 
                You can request data deletion at any time:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li><strong>Individual Records:</strong> Deleted immediately when requested</li>
                <li><strong>Account Data:</strong> Removed within 30 days of account deletion request</li>
                <li><strong>File Attachments:</strong> Deleted immediately with associated records</li>
                <li><strong>Backup Data:</strong> Removed from any backup systems within 90 days</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">8. Cookies and Tracking</Title>
              <Text>
                The application uses minimal tracking mechanisms:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li><strong>Session Cookies:</strong> To maintain your logged-in state</li>
                <li><strong>Local Storage:</strong> For application preferences and temporary data</li>
                <li><strong>No Analytics:</strong> We do not use Google Analytics or similar services</li>
                <li><strong>No Advertising:</strong> No advertising cookies or trackers</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">9. Children's Privacy</Title>
              <Text>
                This application is designed for business use and is not intended for children under 13. 
                We do not knowingly collect personal information from children under 13. 
                If we become aware that we have collected such information, we will delete it promptly.
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">10. Changes to Privacy Policy</Title>
              <Text>
                We may update this Privacy Policy from time to time. When we do, we will:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li>Update the "Last Updated" date at the top of this policy</li>
                <li>Notify users of significant changes through the application</li>
                <li>Maintain previous versions for reference if needed</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">11. Contact Information</Title>
              <Text>
                For questions about this Privacy Policy or your data, please contact the application 
                administrator. As this is a personal application, response times may vary.
              </Text>
              <Text mt="sm">
                You have the right to:
              </Text>
              <Text component="ul" pl="md" mt="xs">
                <li>Request information about what data we have about you</li>
                <li>Request corrections to your data</li>
                <li>Request deletion of your data</li>
                <li>Request data in a portable format</li>
              </Text>
            </section>

            <section>
              <Title order={2} size="h3" mb="sm">12. Legal Compliance</Title>
              <Text>
                This Privacy Policy is designed to comply with applicable privacy laws including GDPR, 
                CCPA, and other relevant regulations. As a personal application with local data storage, 
                many traditional privacy concerns are mitigated by the architecture of the system.
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
