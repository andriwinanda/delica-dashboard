# Delica Dashboard - n8n Integration

A Vue 3 dashboard for managing WhatsApp messaging and lead scoring with n8n workflow automation.

## 🚀 Features

- **WhatsApp Messaging**: Send automated messages via n8n webhooks
- **Lead Scoring**: Manage and score leads with grouping functionality
- **Message Takeover**: Handle incoming WhatsApp messages
- **CORS Handling**: Proxy configuration for seamless API communication

## 🔧 Setup

### 1. Environment Variables

Create a `.env` file in the project root with your n8n webhook URLs:


### 2. CORS Configuration

#### Development (Automatic)
The Vite development server includes proxy configuration that automatically handles CORS issues. API calls are proxied through:
- `/api/whatsapp` → `VITE_WHATSAPP_WEBHOOK_URL`
- `/api/leads` → `VITE_LEADS_API_URL`
- `/api/takeover` → `VITE_TAKEOVER_WEBHOOK_URL`

#### Production (n8n Configuration)
For production deployment, configure CORS in your n8n instance:

1. **Enable CORS Headers** in your n8n webhook nodes:
   ```
   Access-Control-Allow-Origin: https://your-dashboard-domain.com
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

2. **Webhook Configuration**:
   - Set HTTP Method to allow OPTIONS requests
   - Add CORS headers to all webhook responses

3. **Alternative**: Use a reverse proxy (nginx/apache) to handle CORS

### 3. n8n Workflow Setup

#### WhatsApp Webhook
- **URL**: `https://your-n8n-instance.com/webhook/whatsapp`
- **Method**: POST
- **Expected Payload**:
  ```json
  {
    "phone": "+6281234567890",
    "message": "Your message content"
  }
  ```

#### Leads API Webhook
- **URL**: `https://your-n8n-instance.com/webhook/leads`
- **Method**: GET
- **Response Format**:
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "+6281234567890",
      "score": 85,
      "label": "Hot Lead",
      "group": "High Priority"
    }
  ]
  ```

#### Message Takeover Webhook
- **URL**: `https://your-n8n-instance.com/webhook/takeover`
- **Method**: POST
- **Use Case**: Handle incoming WhatsApp messages and update lead scores

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

## 🔒 Security Notes

- Environment variables are only accessible in development
- In production, ensure proper CORS configuration on your n8n instance
- Never commit `.env` files with real webhook URLs
- Use HTTPS in production for secure communication

## 📝 API Error Handling

The application includes comprehensive error handling for:
- **CORS Errors**: Automatic fallback and user notifications
- **Network Errors**: Graceful degradation with mock data
- **API Errors**: Detailed error messages and status codes

## 🎯 Usage

1. **Configure Environment**: Update `.env` with your n8n webhook URLs
2. **Start Development**: Run `npm run dev`
3. **Send Messages**: Use the WhatsApp tab to trigger automated messages
4. **View Leads**: Monitor lead scoring and grouping in the Leads tab
5. **Settings**: View current webhook configuration in the Settings tab

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `npm run typecheck`
5. Test CORS functionality
6. Submit a pull request