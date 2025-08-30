# ccusage Web Dashboard

A beautiful web dashboard for visualizing Claude Code usage data with interactive charts and real-time monitoring.

![ccusage Web Dashboard](./docs/dashboard-preview.png)

## Features

- **📊 Interactive Charts**: Beautiful visualizations using Ant Design Charts
- **📅 Multiple Views**: Daily, Monthly, Session, and 5-Hour Block analysis
- **🔴 Live Monitoring**: Real-time usage tracking with auto-refresh
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎨 Modern UI**: Clean interface built with Ant Design
- **⚡ Fast Performance**: Optimized data loading and caching
- **🔍 Advanced Filters**: Filter by date range, projects, models, and more

## Quick Start

### Prerequisites

- Node.js 20.19.4 or higher
- Bun (recommended) or npm
- Existing ccusage CLI installation with data

### Installation

1. **Install dependencies:**
   ```bash
   cd web
   bun install
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   bun install
   ```

3. **Install client dependencies:**
   ```bash
   cd client
   bun install
   ```

### Running the Dashboard

1. **Start both server and client** (from `web/` directory):
   ```bash
   bun run dev
   ```
   This will start:
   - Backend API server on http://localhost:3001
   - Frontend development server on http://localhost:5173

2. **Or start individually:**
   ```bash
   # Start backend only
   bun run server:dev
   
   # Start frontend only (in another terminal)
   bun run client:dev
   ```

3. **Open your browser** to http://localhost:5173

## Dashboard Pages

### 📅 Daily Usage
- Daily cost and token trends
- Model usage breakdown
- Detailed daily statistics
- Filterable by date range and cost calculation mode

### 📊 Monthly Overview
- Monthly aggregated data
- Year-over-year comparisons
- Model distribution analysis
- Long-term trend visualization

### 📁 Sessions Analysis
- Session-based usage tracking
- Project groupings
- Session details with model breakdowns
- Filter by projects and time periods

### ⏰ 5-Hour Blocks
- Claude's billing block analysis
- Active block monitoring
- Block-to-block comparisons
- Usage alerts and projections

### 🔴 Live Monitoring
- Real-time usage updates
- Current session tracking
- Usage alerts and thresholds
- Auto-refresh with manual controls

## API Endpoints

The backend exposes RESTful API endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/daily` | Daily usage data |
| `GET /api/daily/summary` | Daily summary statistics |
| `GET /api/monthly` | Monthly usage data |
| `GET /api/monthly/summary` | Monthly summary statistics |
| `GET /api/session` | Session usage data |
| `GET /api/session/summary` | Session summary statistics |
| `GET /api/blocks` | 5-hour block data |
| `GET /api/blocks/summary` | Block summary statistics |
| `GET /api/live/current` | Current usage data |
| `GET /api/live/ws` | WebSocket for live updates |

### Query Parameters

All endpoints support these query parameters:

- `mode`: Cost calculation mode (`auto`, `calculate`, `display`)
- `instances`: Include project instances (`true`, `false`)
- `from`/`to`: Date range filter (`YYYY-MM-DD`)
- `project[]`: Filter by project names
- `model[]`: Filter by model names  
- `sortOrder`: Sort order (`desc`, `asc`)
- `active`: Show only active blocks (`true`, `false`)
- `recent`: Show recent data only (`true`, `false`)

## Development

### Project Structure

```
web/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── charts/     # Chart components
│   │   │   └── layout/     # Layout components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── main.tsx        # App entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Hono backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
└── package.json           # Root package.json
```

### Adding New Features

1. **Backend**: Add new routes in `server/src/routes/`
2. **Frontend**: Add new components in `client/src/components/`
3. **API Integration**: Update `client/src/services/api.ts`
4. **Routing**: Update `client/src/App.tsx`

### Building for Production

```bash
# Build both client and server
bun run build

# Build individually
bun run client:build
bun run server:build
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `LOG_LEVEL`: Logging level (0-5, default: 2)
- `CLAUDE_CONFIG_DIR`: Custom Claude data directory path

### Customization

- **Theme**: Modify `client/src/main.tsx` for Ant Design theme
- **API Base URL**: Update `client/src/services/api.ts`
- **Chart Colors**: Customize in chart components
- **Refresh Intervals**: Adjust in `client/src/pages/LivePage.tsx`

## Troubleshooting

### Common Issues

1. **No data showing**:
   - Ensure ccusage CLI has generated data files
   - Check Claude data directory path
   - Verify API server is running on port 3001

2. **API connection errors**:
   - Check if backend server is running
   - Verify proxy configuration in `vite.config.ts`
   - Check browser console for CORS errors

3. **Live updates not working**:
   - Ensure WebSocket connection is established
   - Check network connectivity
   - Try manual refresh

### Data Location

The dashboard reads data from the same locations as ccusage CLI:
- `~/.config/claude/projects/` (new default)
- `~/.claude/projects/` (old default)
- Custom path via `CLAUDE_CONFIG_DIR`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Same as ccusage CLI - MIT License