import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";

export interface VerifyEmailProps {
  verifyUrl: string;
  baseUrl: string;
}

export const VerifyEmail = ({ verifyUrl, baseUrl }: VerifyEmailProps) => {
  const previewText = "Verify your email address for MC-ID";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-black px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-xl border border-solid border-[#ffffff1a] bg-black p-[20px]">
            <Section>
              <Img src={`${baseUrl}/assets/images/MC-ID-White.png`} width="52" height="52" alt="MinionAH" className="mx-auto my-0" />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-[#e6e6e6]">Verify your email address</Heading>
            <Text className="text-[14px] leading-[24px] text-[#e6e6e6]">Hello,</Text>
            <Text className="mt-[16px] text-[14px] leading-[24px] text-[#e6e6e6]">Thank you for signing up for MC-ID! Please verify your email address by clicking the button below.</Text>
            <Text className="mt-[16px] text-[14px] leading-[24px] text-[#e6e6e6]">If you did not create an account, no further action is required.</Text>
            <Section className="mt-[32px] text-center">
              <Button className="rounded-md bg-[#00bc7d] px-5 py-3 text-center text-[12px] font-semibold text-[#0d542b] no-underline" href={verifyUrl}>
                Verify Email
              </Button>
            </Section>
            <Hr className="my-[32px] border-t border-solid !border-t-[#ffffff1a]" />
            <Text className="mt-[32px] text-[14px] leading-[24px] text-[#e6e6e6]">If the button above does not work, copy and paste the following link into your web browser:</Text>
            <Section className="text-center">
              <Link href={verifyUrl} className="text-[14px] leading-[24px] break-all text-[#00bc7d]" target="_blank" rel="noopener noreferrer">
                {verifyUrl}
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VerifyEmail.PreviewProps = {
  verifyUrl: "https://example.com/verify?token=abc123",
  baseUrl: "http://localhost:5173"
} as VerifyEmailProps;

export default VerifyEmail;
