import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Copy, 
  Download,
  Sparkles,
  Building2,
  Target,
  TrendingUp
} from 'lucide-react';
import './App.css';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [formData, setFormData] = useState({
    clientName: '',
    projectDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const [caseStudy, setCaseStudy] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('full');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  

  const generateCaseStudy = async (endpoint) => {
    if (!formData.clientName.trim() || !formData.projectDetails.trim()) {
      setError('Please fill in both client name and project details.');
      return;
    }

    setLoading(true);
    setError(null);
    setCaseStudy(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, {
        client_name: formData.clientName.trim(),
        project_details: formData.projectDetails.trim()
      });

      setCaseStudy(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while generating the case study.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadCaseStudy = () => {
    if (!caseStudy?.full_case_study) return;
    
    const element = document.createElement('a');
    const file = new Blob([caseStudy.full_case_study], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `case-study-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Sparkles className="logo-icon" />
            <h1>Tekrowe Case Study Generator</h1>
          </div>
          <p className="subtitle">Professional B2B case studies powered by AI</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Input Form */}
          <div className="form-section">
            <div className="form-header">
              <Building2 className="form-icon" />
              <h2>Project Information</h2>
            </div>
            
            <div className="form-group">
              <label htmlFor="clientName">Client Name *</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="Enter client company name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectDetails">Project Details *</label>
              <textarea
                id="projectDetails"
                name="projectDetails"
                value={formData.projectDetails}
                onChange={handleInputChange}
                placeholder="Describe the project, challenges, solutions, and outcomes..."
                className="form-textarea"
                rows="6"
              />
            </div>

            <div className="form-actions">
              <button
                onClick={() => generateCaseStudy('generate-case-study')}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="btn-icon spinning" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="btn-icon" />
                    Generate Full Case Study
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Case Study Output */}
          {caseStudy && (
            <div className="output-section">
              <div className="output-header">
                <Target className="output-icon" />
                <h2>Generated Case Study</h2>
                <div className="output-actions">
                  <button
                    onClick={() => copyToClipboard(caseStudy.full_case_study)}
                    className="btn btn-secondary btn-small"
                    title="Copy to clipboard"
                  >
                    <Copy className="btn-icon" />
                    Copy
                  </button>
                  <button
                    onClick={downloadCaseStudy}
                    className="btn btn-secondary btn-small"
                    title="Download as markdown"
                  >
                    <Download className="btn-icon" />
                    Download
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="tab-navigation">
                <button
                  className={`tab ${activeTab === 'full' ? 'active' : ''}`}
                  onClick={() => setActiveTab('full')}
                >
                  <FileText className="tab-icon" />
                  Full Case Study
                </button>
                <button
                  className={`tab ${activeTab === 'intro' ? 'active' : ''}`}
                  onClick={() => setActiveTab('intro')}
                >
                  <Target className="tab-icon" />
                  Introduction
                </button>
                <button
                  className={`tab ${activeTab === 'solution' ? 'active' : ''}`}
                  onClick={() => setActiveTab('solution')}
                >
                  <Building2 className="tab-icon" />
                  Solution
                </button>
                <button
                  className={`tab ${activeTab === 'impact' ? 'active' : ''}`}
                  onClick={() => setActiveTab('impact')}
                >
                  <TrendingUp className="tab-icon" />
                  Impact & Values
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'full' && (
                  <div className="markdown-content">
                    <ReactMarkdown>{caseStudy.full_case_study}</ReactMarkdown>
                  </div>
                )}
                {activeTab === 'intro' && (
                  <div className="markdown-content">
                    <ReactMarkdown>{caseStudy.introduction}</ReactMarkdown>
                  </div>
                )}
                {activeTab === 'solution' && (
                  <div className="markdown-content">
                    <ReactMarkdown>{caseStudy.solution}</ReactMarkdown>
                  </div>
                )}
                {activeTab === 'impact' && (
                  <div className="markdown-content">
                    <ReactMarkdown>{caseStudy.impact_values}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Tekrowe. Professional case study generation powered by Tekrowe.</p>
      </footer>
    </div>
  );
}

export default App;
