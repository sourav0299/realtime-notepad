# Real-Time Notepad

A collaborative real-time notepad application built with Next.js, Supabase, and ReactQuill. The application allows users to create, edit and share notepads in real-time.

## Features

- 🔄 Real-time collaboration
- 📝 Rich text editing
- 🌓 Dark/Light mode
- 🔗 Shareable notepad links
- 📱 Responsive design
- 🔐 Basic API authentication
- 📋 List all notepads
- ❌ Delete notepads

## Tech Stack

- **Frontend:**
  - Next.js 14
  - React 18
  - TailwindCSS
  - shadcn/ui components
  - React Quill for rich text editing

- **Backend:**
  - Supabase (PostgreSQL + Real-time subscriptions)

- **Additional Tools:**
  - TypeScript
  - next-themes for dark mode
  - react-hot-toast for notifications
  - Lodash for debouncing

## Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/realtime-notepad.git
cd realtime-notepad
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
API_KEY=your_api_key
API_SECRET=your_api_secret
AUTH_COOKIE=your_cookie_value
```

4. Set up Supabase:
- Create a new Supabase project
- Run the following SQL in Supabase SQL editor:
```sql
create table notepad (
  id text primary key,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

5. Run the development server:
```bash
npm run dev
```

## Project Structure

```
├── app/
│   ├── all-notepads/     # All notepads listing page
│   ├── components/       # Shared components
│   │   ├── AuthDialogBox.tsx
│   │   ├── Editor.tsx
│   │   └── ui/          # UI components
│   ├── notepad/         # Individual notepad page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── lib/
│   └── supabase.ts      # Supabase client
├── types/               # TypeScript types
├── utils/              # Utility functions
└── package.json
```

## Key Features

### Real-time Collaboration
- Multiple users can edit the same notepad simultaneously
- Changes are synced in real-time using Supabase subscriptions
- Debounced saves to prevent excessive database updates

### Rich Text Editor
- Full WYSIWYG editing experience
- Support for formatting, lists, and code blocks
- Image upload functionality
- Keyboard shortcuts

### Authentication
- Admin access control via API key authentication
- Secure cookie-based session management
- Protected routes and operations

## API Routes

### `GET /api/notepads`
- Lists all notepads
- Requires authentication

### `POST /api/notepad`
- Creates a new notepad
- Body: `{ content: string }`

### `PUT /api/notepad/[id]`
- Updates notepad content
- Body: `{ content: string }`

### `DELETE /api/notepad/[id]`
- Deletes a notepad
- Requires authentication

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Deployment

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
- Open an issue on GitHub
- Join our Discord community
- Check the documentation

## Roadmap

### Current Goals
- [ ] User authentication and accounts
- [ ] Collaborative cursors
- [ ] File attachments
- [ ] Version history
- [ ] Custom themes

### AI Integration Plans
- [ ] Text Enhancement Features
  - [ ] Grammar and spell checking
  - [ ] Style suggestions
  - [ ] Text summarization
  - [ ] Readability scoring
  
- [ ] Content Generation
  - [ ] AI-powered content suggestions
  - [ ] Auto-completion for sentences
  - [ ] Title generation from content
  - [ ] Keywords extraction
  
- [ ] Language Support
  - [ ] Real-time translation
  - [ ] Multi-language support
  - [ ] Language detection
  - [ ] Tone adjustment

- [ ] Smart Features
  - [ ] Content categorization
  - [ ] Topic extraction
  - [ ] Related content suggestions
  - [ ] Smart search with semantic understanding
  
- [ ] Collaboration Tools
  - [ ] AI-powered conflict resolution
  - [ ] Smart merging of concurrent edits
  - [ ] Content quality scoring
  
- [ ] Code Enhancement
  - [ ] Code syntax highlighting
  - [ ] Code explanation
  - [ ] Code review suggestions
  - [ ] Code completion

- [ ] Document Analysis
  - [ ] Sentiment analysis
  - [ ] Content structure suggestions
  - [ ] Plagiarism detection
  - [ ] Citation generation
