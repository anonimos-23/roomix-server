import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface RecoverPasswordEmailProps {
  userFirstname?: string
  resetPasswordLink?: string
}

export function RecoverPasswordEmail({
  userFirstname,
  resetPasswordLink,
}: RecoverPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Roomix recupera a tua palavra-passe</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={`/static/logo.webp`} width={'50%'} alt="Roomix logo" />
          <Section>
            <Text style={text}>
              Olá <b>{userFirstname}</b>,
            </Text>
            <Text style={text}>
              Alguém solicitou recentemente uma alteração da palavra-passe da
              sua conta Roomix. Se foi o seu caso, pode definir uma nova
              palavra-passe aqui:
            </Text>
            <Button style={button} href={resetPasswordLink}>
              Redefinir palavra-passe
            </Button>
            <Text style={text}>
              Se não quiser alterar a sua palavra-passe ou não o tiver
              solicitado, ignore e apague esta mensagem.
            </Text>
            <Text style={text}>
              Para manter a sua conta segura, não reencaminhe este email para
              ninguém.
            </Text>
            <Text style={text}>
              Ass: <em>Equipa de suporte do Roomix</em>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

RecoverPasswordEmail.PreviewProps = {
  userFirstname: 'Alan',
  resetPasswordLink: 'http://localhost:5173/reset-password?code=xyz',
} as RecoverPasswordEmailProps

export default RecoverPasswordEmail

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
}

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
}

const anchor = {
  textDecoration: 'underline',
}
