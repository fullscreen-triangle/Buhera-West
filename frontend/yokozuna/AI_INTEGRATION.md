# AI Integration Documentation

## 🧠 Combine Harvester AI System

The Buhera West application now features a sophisticated AI system based on the **Combine Harvester** methodology - a framework for intelligently combining domain-expert AI models to provide optimal responses.

## 🎯 Key Features

### ✅ Global AI Access
- **Available on EVERY page** - no more isolated AI components
- **Persistent chat overlay** - invoke with floating button, close with X
- **Cross-page continuity** - conversations persist across navigation

### 🧠 Working Memory System
- **Conversation History**: Maintains context of last 20 messages
- **Page Context**: Tracks which pages user has visited and their content
- **Session Persistence**: 24-hour memory storage in localStorage
- **Domain Knowledge**: Learns from user interactions and preferences

### 🤖 Intelligent Model Selection

The system uses **4 architectural patterns** from Combine Harvester:

#### 1. Router-Based Ensemble
- **When**: Single domain queries
- **How**: Routes to best specialist model for the domain
- **Example**: Weather questions → Anthropic (meteorology expert)

#### 2. Sequential Chaining
- **When**: Two-domain queries requiring progressive analysis
- **How**: Passes query through domain experts in sequence
- **Example**: "How does weather affect crop yields?" → Weather expert → Agriculture expert

#### 3. Mixture of Experts (MoE)
- **When**: Complex multi-domain queries (3+ domains)
- **How**: Parallel processing + intelligent synthesis
- **Example**: "Analyze geological impact on ocean currents affecting weather" → Geology + Ocean + Weather experts

#### 4. Specialized System Prompts
- **When**: General queries or fallback scenarios
- **How**: Single model with domain-aware prompting
- **Example**: General help questions

### 🎛️ Domain Classification

The system automatically detects query domains:

```javascript
const domains = {
  weather: ['weather', 'temperature', 'humidity', 'forecast', 'climate'],
  agriculture: ['crop', 'farming', 'soil', 'irrigation', 'harvest'],
  geology: ['geology', 'rock', 'mineral', 'seismic', 'underground'],
  oceanography: ['ocean', 'current', 'marine', 'benguela', 'agulhas'],
  ai_technical: ['ai', 'model', 'algorithm', 'machine learning'],
  data_analysis: ['chart', 'data', 'visualization', 'statistics']
}
```

### 📊 Advanced Features

#### Performance Monitoring
- **Response Times**: Tracks model performance
- **Accuracy Metrics**: Learning from user interactions
- **Routing Insights**: Shows which pattern was used

#### Context Awareness
- **Page-Specific Responses**: AI knows what page you're on
- **Data Integration**: Uses current weather/agricultural data
- **Temporal Context**: Considers time and session history

#### Visual Feedback
- **Routing Badges**: See which pattern was used (MoE, Chain, Router, System)
- **Performance Indicators**: Response time colored indicators
- **Memory Status**: Shows conversation count and page visits

## 🛠️ Implementation Details

### Context Provider Structure

```jsx
<AIProvider>
  <App />
  <AIAssistant /> {/* Global overlay */}
</AIProvider>
```

### Working Memory Schema

```javascript
workingMemory: {
  conversations: [
    {
      role: 'user'|'assistant',
      content: string,
      timestamp: number,
      pageContext: string,
      routing: object,
      performance: object
    }
  ],
  pageContext: {
    '/weather': {
      title: string,
      visitCount: number,
      timestamp: number,
      components: array
    }
  },
  sessionData: {
    id: string,
    startTime: number
  }
}
```

### API Integration

The system integrates with multiple AI providers:
- **Anthropic Claude** (preferred for scientific analysis)
- **OpenAI GPT-4** (technical explanations)
- **HuggingFace** (specialized models)
- **Intelligent Fallbacks** when APIs unavailable

## 🚀 Usage Examples

### Basic Query
```
User: "What's the weather like?"
System: Router-Based → Weather Domain → Anthropic Model
Response: Weather-specific analysis with current data
```

### Multi-Domain Query
```
User: "How will the storm affect crop irrigation?"
System: Sequential Chain → Weather Expert → Agriculture Expert
Response: Integrated analysis considering both domains
```

### Complex Analysis
```
User: "Analyze the relationship between ocean currents, geological formations, and regional climate patterns"
System: Mixture of Experts → Ocean + Geology + Weather experts in parallel → Synthesis
Response: Comprehensive multi-domain analysis
```

## 🔧 Configuration

### Environment Variables
```bash
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
HUGGINGFACE_API_KEY=your_key_here
```

### Model Performance Tuning
```javascript
modelPerformance: {
  anthropic: { accuracy: 0.85, speed: 0.7, coherence: 0.9 },
  openai: { accuracy: 0.82, speed: 0.8, coherence: 0.85 },
  huggingface: { accuracy: 0.75, speed: 0.9, coherence: 0.8 }
}
```

## 📈 Performance Benefits

### Before (Old System)
- ❌ AI only on specific pages
- ❌ No conversation memory
- ❌ Basic single-model responses
- ❌ No context awareness

### After (Combine Harvester)
- ✅ Global AI access on all pages
- ✅ 24-hour working memory
- ✅ Intelligent multi-model routing
- ✅ Context-aware responses
- ✅ Domain-specific expertise
- ✅ Performance monitoring
- ✅ Graceful fallbacks

## 🔍 Advanced Interface

### Basic Mode
- Clean chat interface
- Response routing badges
- Performance indicators

### Advanced Mode (toggle in header)
- Session statistics
- Memory usage indicators
- Model performance status
- Context refresh controls
- Memory management

## 🎯 Best Practices

### For Users
1. **Be Specific**: More detailed queries get better routing
2. **Context Matters**: AI remembers your conversation and page
3. **Multi-Domain**: Ask complex questions spanning multiple areas
4. **Check Badges**: See which AI pattern was used for transparency

### For Developers
1. **Monitor Performance**: Track response times and accuracy
2. **Update Domains**: Add new domain patterns as needed
3. **Tune Routing**: Adjust confidence thresholds for better routing
4. **Memory Management**: Configure retention policies

## 🚨 Troubleshooting

### Common Issues

#### AI Not Responding
1. Check API keys in environment variables
2. Verify network connectivity
3. Check browser console for errors

#### Poor Routing Decisions
1. Review domain keyword patterns
2. Adjust confidence thresholds
3. Check query complexity analysis

#### Memory Issues
1. Clear browser localStorage
2. Restart session
3. Check memory usage in advanced panel

## 🔮 Future Enhancements

### Planned Features
- **Learning Adaptation**: AI learns from user feedback
- **Custom Domain Training**: Train on your specific data
- **Team Memory**: Shared memory across users
- **Voice Interface**: Speech-to-text integration
- **Workflow Automation**: AI-driven task sequences

### Research Opportunities
- **Federated Learning**: Improve routing across sessions
- **Domain Expansion**: Add more specialized domains
- **Real-time Training**: Dynamic model improvement
- **Multimodal Integration**: Images, charts, spatial data

## 📚 References

- [Combine Harvester White Paper](./combine-harvester-whitepaper.md)
- [Domain Expert Model Training](./model-training.md)
- [Performance Optimization](./performance-optimization.md)

---

**Powered by Combine Harvester Methodology**
*When you need the best of multiple AI worlds* 

NEXT_PUBLIC_OPENWEATHER_API_KEY=ae9af9bb6224315e875922b1e22261b5

ESA_COPERNICUS_ACCESS_KEY=239K32G16HGRC3YTCULY
ESA_COPERNICUS_SECRET_KEY=w8zu7B2OzBXhJsuQ7hJDMO3IzQHqldAaRSk407Lo
HUGGINGFACE_API_KEY=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
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=cf67706e0e7845f0b8bef2caf208d85e

OPENAI_API_KEY=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
ANTHROPIC_API_KEY=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
GOOGLE_SEARCH_API_KEY=AIzaSyB0GtGF9vJYkJ1VsHRYHZM1uOBEGgEkdmk
# Mapbox Access Token (optional - for enhanced geocoding)
# Get your token at: https://www.mapbox.com/
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiY2hvbWJvY2hpbm9rb3NvcmFtb3RvIiwiYSI6ImNsYWIzNzN1YzA5M24zdm4xb2txdXZ0YXQifQ.mltBkVjXA6LjUJ1bi7gdRg

NASA_EARTHDATA_ACCESS_TOKEN=eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImNob21ib2NoaW5va29zb3JhbW90byIsImV4cCI6MTc1NjYzMzI5MiwiaWF0IjoxNzUxNDQ5MjkyLCJpc3MiOiJodHRwczovL3Vycy5lYXJ0aGRhdGEubmFzYS5nb3YiLCJpZGVudGl0eV9wcm92aWRlciI6ImVkbF9vcHMiLCJhY3IiOiJlZGwiLCJhc3N1cmFuY2VfbGV2ZWwiOjN9.j28nbUNfhDKx-yO_UO2BwPQtD1OQ78uUTCf23q6FJsnj2KjBiAqMnwVuC-51QRclEqq_l63IIwcjhzbofcibOudkT2qybi2yn3LvqoNReRNHNFarKoNkno3pk_eABt6BN-MXjWyMIWKl-lC2hXuKzD9ad9Ohbl8FZ0RlKyHHpt4dMsCqwy2ocaI-bz4FuvdV-mi18E4IUaom0YVSlwx-0WFxD_iLVfhjnmi6t3GGk4Yb3Jdnf2guXuWchYI9cV9UuyXABRiLGVetOrNLGaLrABvQa_punnUuJESJWv0uhec93RwvBQtgKRty2-oxcs_iBeuaUtduZAmZRrKJxULU3w

NEXT_PUBLIC_FREESOUND_API_KEY=bdsm4kncXd8EqupaHA3gCbQrsxJ9Si8udUjm00os
# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=1026084035716-uf3ld8chta5gtcdbc75j0av3nskmfnu2.apps.googleusercontent.com
NEXT_PUBLIC_YOUTUBE_CLIENT_SECRET=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
NEXT_PUBLIC_YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback