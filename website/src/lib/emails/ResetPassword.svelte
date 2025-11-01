<script lang="ts">
  import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "better-svelte-email";

  export interface ResetPasswordProps {
    resetUrl: string;
    baseUrl: string;
  }

  const { resetUrl = "https://example.com/reset?token=abc123", baseUrl = "http://localhost:5173" }: ResetPasswordProps = $props();
  const previewText = "Reset your password for MC-ID";
</script>

<Html class="bg-black">
  <Head />
  <Preview preview={previewText} />

  <Body class="mx-auto my-auto bg-black px-2 font-sans">
    <Container class="mx-auto my-[40px] max-w-[465px] rounded-xl border border-solid border-[#ffffff1a] bg-black p-[20px]">
      <Section>
        <Img src={`${baseUrl}/assets/images/MC-ID-White.png`} width="52" height="52" alt="MinionAH" class="mx-auto my-0" />
      </Section>
      <Heading as="h1" class="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-[#e6e6e6]">Reset your password</Heading>
      <Text class="text-[14px] leading-[24px] text-[#e6e6e6]">Hello,</Text>
      <Text class="mt-[16px] text-[14px] leading-[24px] text-[#e6e6e6]">We received a request to reset your password for your MC-ID account. If you made this request, please click the button below to reset your password.</Text>
      <Section class="mt-[16px] text-center">
        <Button class="rounded-md bg-[#00bc7d] px-5 py-3 text-center text-[12px] font-semibold text-[#0d542b] no-underline" href={resetUrl}>Reset Password</Button>
      </Section>
      <Text class="mt-[32px] text-[14px] leading-[24px] text-[#e6e6e6]">If you don't want to change your password or didn't request this, just ignore and delete this message.</Text>
      <Hr style="border: 1px solid #ffffff1a" class="my-[32px] border-t border-solid !border-t-[#ffffff1a]" />
      <Text class="mt-[32px] text-[14px] leading-[24px] text-[#e6e6e6]">If the button above does not work, copy and paste the following link into your web browser:</Text>
      <Section class="text-center">
        <Link href={resetUrl} class="text-[14px] leading-[24px] break-all text-[#00bc7d]" target="_blank" rel="noopener noreferrer">
          {resetUrl}
        </Link>
      </Section>
    </Container>
  </Body>
</Html>
