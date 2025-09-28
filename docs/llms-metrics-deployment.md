# Making llms.txt Metrics Actually Work

## Current Status
The metrics dashboard is a demo showing how the system would work. To make it functional, you need:

## 1. Backend API Server

Create an actual Node.js/Express server:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const client = new MongoClient(mongoUrl);

// Track beacon hits
app.get('/api/v1/beacon/:beaconId', async (req, res) => {
    const { beaconId } = req.params;
    const userAgent = req.headers['user-agent'];
    
    // Store in MongoDB
    const db = client.db('devmcp');
    await db.collection('discoveries').insertOne({
        beacon_id: beaconId,
        timestamp: new Date(),
        user_agent: userAgent,
        ip: req.ip,
        referer: req.headers['referer']
    });
    
    // Return 1x1 pixel or empty response
    res.status(204).send();
});

// Get metrics for dashboard
app.get('/api/v1/metrics/dashboard', async (req, res) => {
    const db = client.db('devmcp');
    
    // Aggregate real data
    const discoveries = await db.collection('discoveries')
        .aggregate([
            { $group: { 
                _id: '$beacon_id', 
                count: { $sum: 1 } 
            }},
            { $count: 'total' }
        ]).toArray();
    
    res.json({
        overview: {
            total_discoveries: discoveries[0]?.total || 0,
            // ... more aggregations
        }
    });
});

app.listen(3000);
```

## 2. Database Schema

MongoDB collections needed:

```javascript
// discoveries collection
{
    beacon_id: "example-com-1234567-abc",
    timestamp: ISODate("2025-01-28T10:30:00Z"),
    user_agent: "Claude-Web/1.0",
    ai_agent: "claude",
    ip: "192.168.1.1",
    country: "US"
}

// api_usage collection  
{
    domain: "example.com",
    endpoint: "/api/v1/query",
    timestamp: ISODate("2025-01-28T10:31:00Z"),
    success: true,
    response_time_ms: 142,
    api_key_hash: "sk-abc...xyz"
}

// domains collection
{
    domain: "example.com",
    created: ISODate("2025-01-20T08:00:00Z"),
    total_discoveries: 1247,
    unique_agents: ["claude", "gpt4", "chatgpt"],
    last_discovery: ISODate("2025-01-28T10:30:00Z")
}
```

## 3. Deployment Steps

### Option A: Deploy to Vercel (Serverless)

```bash
# Install Vercel CLI
npm i -g vercel

# Create API routes
mkdir api
mv api/llms-metrics-api.js api/metrics.js

# Deploy
vercel
```

### Option B: Deploy to AWS/GCP/Azure

1. Set up a Node.js server
2. Configure MongoDB Atlas or equivalent
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up monitoring

## 4. Update Frontend

Change the API endpoints in the dashboard:

```javascript
// js/llms-metrics-dashboard.js
class MetricsDashboard {
    constructor() {
        // Change from local to production API
        this.apiEndpoint = 'https://api.devmcp.ai';
    }
}
```

## 5. CORS and Security

Configure CORS for beacon tracking:

```javascript
app.use(cors({
    origin: '*', // Allow all origins for beacon
    methods: ['GET', 'POST'],
    credentials: true
}));
```

## 6. Make Beacons Work

The beacon in llms.txt should be a simple GET request:

```
# beacon: https://api.devmcp.ai/v1/beacon/your-domain-com-12345
```

This works because:
- AI agents that parse llms.txt will follow the URL
- It's a comment, so it doesn't break parsing
- Returns 204 No Content (no data needed)

## 7. Testing Locally

```bash
# 1. Start MongoDB locally
mongod

# 2. Install dependencies
npm init -y
npm install express cors mongodb

# 3. Run server
node server.js

# 4. Test beacon
curl http://localhost:3000/api/v1/beacon/test-123

# 5. Check metrics
curl http://localhost:3000/api/v1/metrics/dashboard
```

## Current Demo Limitations

The current implementation:
- ✅ Shows how the dashboard would look
- ✅ Demonstrates the user experience
- ✅ Provides integration examples
- ❌ Doesn't actually track anything
- ❌ Data resets on page reload
- ❌ API calls are simulated client-side

To make it production-ready, you need the backend infrastructure described above.