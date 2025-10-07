# iCMS - Integrated Content Management System

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Office Settings Management**: Configure office information with translatable fields
- **Background Photo Upload**: Upload and manage office background photos with Backblaze B2 integration
- **Multi-language Support**: English and Nepali language support
- **Responsive Design**: Modern UI built with Carbon Design System
- **Authentication**: Secure login system with role-based access control

## Getting Started

### Prerequisites

1. Node.js 18+ and npm/yarn
2. Backblaze B2 account (for file storage) - [Setup Guide](./docs/backblaze-setup.md)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy the environment template:

```bash
cp env.example .env.local
```

4. Configure your environment variables (see [Backblaze Setup Guide](./docs/backblaze-setup.md))

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

### Environment Variables

See [env.example](./env.example) for all available environment variables.

### Backblaze B2 Setup

For the background photo upload feature, you'll need to configure Backblaze B2 cloud storage. See the [Backblaze Setup Guide](./docs/backblaze-setup.md) for detailed instructions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
