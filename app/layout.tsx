export const metadata = {
  title: 'REDI Srbija CRM',
  description: 'CRM platforma za REDI Srbija',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  )
}
