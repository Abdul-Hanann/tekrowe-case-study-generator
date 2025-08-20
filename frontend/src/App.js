import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Copy, 
  Sparkles,
  Building2,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Edit3,
  Save,
  X,
  RotateCcw
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
  const [progress, setProgress] = useState({
    step1: { status: 'pending', message: 'Introduction', data: null },
    step2: { status: 'pending', message: 'Solution', data: null },
    step3: { status: 'pending', message: 'Impact & Values', data: null },
    step4: { status: 'pending', message: 'Final Composition', data: null }
  });
  const [streaming, setStreaming] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaseStudy, setEditedCaseStudy] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  // const eventSourceRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const generateCaseStudyStream = async () => {
    if (!formData.clientName.trim() || !formData.projectDetails.trim()) {
      setError('Please fill in both client name and project details.');
      return;
    }

    setStreaming(true);
    setLoading(true);
    setError(null);
    setCaseStudy(null);
    
    // Reset progress
    setProgress({
      step1: { status: 'pending', message: 'Introduction', data: null },
      step2: { status: 'pending', message: 'Solution', data: null },
      step3: { status: 'pending', message: 'Impact & Values', data: null },
      step4: { status: 'pending', message: 'Final Composition', data: null }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/generate-case-study-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: formData.clientName.trim(),
          project_details: formData.projectDetails.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                setError(data.error);
                setStreaming(false);
                setLoading(false);
                return;
              }

              if (data.step === 'final') {
                setCaseStudy(data.data);
                setStreaming(false);
                setLoading(false);
                return;
              }

              if (data.step >= 1 && data.step <= 4) {
                const stepKey = `step${data.step}`;
                setProgress(prev => ({
                  ...prev,
                  [stepKey]: {
                    status: data.status,
                    message: data.message,
                    data: data.data || prev[stepKey]?.data
                  }
                }));

                // If this step has data, update the case study preview
                if (data.data && data.step < 4) {
                  setCaseStudy(prev => {
                    if (!prev) {
                      return {
                        client_name: formData.clientName,
                        introduction: '',
                        solution: '',
                        impact_values: '',
                        full_case_study: ''
                      };
                    }
                    
                    const updated = { ...prev };
                    if (data.step === 1) updated.introduction = data.data;
                    if (data.step === 2) updated.solution = data.data;
                    if (data.step === 3) updated.impact_values = data.data;
                    
                    return updated;
                  });
                }
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the case study.');
      setStreaming(false);
      setLoading(false);
    }
  };



  const copyToClipboard = () => {
    let contentToCopy = '';
    
    if (activeTab === 'intro' && caseStudy?.introduction) {
      contentToCopy = caseStudy.introduction;
    } else if (activeTab === 'solution' && caseStudy?.solution) {
      contentToCopy = caseStudy.solution;
    } else if (activeTab === 'impact' && caseStudy?.impact_values) {
      contentToCopy = caseStudy.impact_values;
    } else if (activeTab === 'full' && caseStudy?.full_case_study) {
      contentToCopy = caseStudy.full_case_study;
    }
    
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const downloadCaseStudyWord = () => {
    if (!caseStudy?.full_case_study) return;
    
    const content = caseStudy.full_case_study;
    
    // Convert markdown to HTML with proper styling
    const htmlContent = convertMarkdownToHTML(content);
    
    // Create simple Word-compatible HTML
    const wordContent = `
      <html>
        <head>
          <meta charset='utf-8'>
          <title>Case Study - ${formData.clientName}</title>
        </head>
        <body style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 1in; color: #2c3e50;">
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #667eea;">
            <h1 style="font-size: 24pt; font-weight: bold; color: #2c3e50; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Case Study</h1>
            <div style="font-size: 14pt; color: #667eea; font-weight: 600; margin: 0;">${formData.clientName}</div>
          </div>
          
          ${htmlContent}
        </body>
      </html>
    `;
    
    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `case-study-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCaseStudyPDF = () => {
    if (!editedCaseStudy && !caseStudy?.full_case_study) return;
    
    const content = editedCaseStudy || caseStudy.full_case_study;
    
    // Convert markdown to HTML with proper styling
    const htmlContent = convertMarkdownToHTML(content);
    
    // Create a new window with the content for printing with professional formatting
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Case Study - ${formData.clientName}</title>
          <style>
            @page {
              size: A4;
              margin: 1in 0.75in;
              @top-center { content: "Case Study - ${formData.clientName}"; }
              @bottom-center { content: "Page " counter(page) " of " counter(pages); }
            }
            
            body { 
              font-family: 'Times New Roman', serif; 
              font-size: 12pt; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0;
              color: #2c3e50;
              background: white;
            }
            
            .container {
              max-width: 8.5in;
              margin: 0 auto;
              padding: 0;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #667eea;
              width: 100%;
            }
            
            .header h1 {
              font-size: 24pt;
              font-weight: bold;
              color: #2c3e50;
              margin: 0 0 10px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
              text-align: center;
            }
            
            .header .subtitle {
              font-size: 14pt;
              color: #667eea;
              font-weight: 600;
              margin: 0;
              text-align: center;
            }
            
            h1, h2, h3, h4, h5, h6 {
              color: #2c3e50;
              margin: 25px 0 15px 0;
              font-weight: bold;
              page-break-after: avoid;
              text-align: left;
              padding-left: 0;
              margin-left: 0;
            }
            
            h1 { 
              font-size: 18pt; 
              border-bottom: 2px solid #667eea; 
              padding-bottom: 8px;
              margin-top: 30px;
              margin-left: 0;
              padding-left: 0;
            }
            
            h2 { 
              font-size: 16pt; 
              color: #667eea; 
              margin-top: 30px;
              margin-left: 0;
              padding-left: 0;
              border-left: none;
            }
            
            h3 { 
              font-size: 14pt; 
              margin-top: 25px;
              color: #34495e;
              margin-left: 0;
              padding-left: 0;
            }
            
            p { 
              margin-bottom: 15px; 
              text-align: left;
              text-indent: 0;
              margin-left: 0;
              padding-left: 0;
            }
            
            ul, ol { 
              margin: 20px 0 20px 0; 
              padding-left: 20px;
            }
            
            li { 
              margin-bottom: 10px; 
              line-height: 1.5;
            }
            
            strong { 
              font-weight: bold; 
              color: #2c3e50;
            }
            
            em { 
              font-style: italic; 
              color: #7f8c8d;
            }
            
            .section-break {
              page-break-before: always;
              margin-top: 40px;
            }
            
            .highlight-box {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 0;
              }
              
              .container {
                max-width: none;
                margin: 0;
                padding: 0;
              }
              
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
              }
              
              p, li {
                orphans: 3;
                widows: 3;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Case Study</h1>
              <div class="subtitle">${formData.clientName}</div>
            </div>
            
            ${htmlContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Helper function to convert markdown to HTML
  const convertMarkdownToHTML = (markdown) => {
    return markdown
      // Remove emojis first
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
      
      // Wrap lists in ul/ol tags
      .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
      
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gim, '<p>$1</p>')
      
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<ul>.*<\/ul>)<\/p>/g, '$1')
      
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  const startEditing = () => {
    setEditedCaseStudy(caseStudy.full_case_study);
    setIsEditing(true);
  };

  const saveChanges = () => {
    setCaseStudy(prev => ({
      ...prev,
      full_case_study: editedCaseStudy
    }));
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedCaseStudy('');
  };

  const resetToInitial = () => {
    // Ask for confirmation before resetting
    if (caseStudy || formData.clientName || formData.projectDetails) {
      const confirmed = window.confirm('Are you sure you want to reset? This will clear all data and return to the initial state.');
      if (!confirmed) return;
    }
    
    setFormData({
      clientName: '',
      projectDetails: ''
    });
    setLoading(false);
    setCaseStudy(null);
    setError(null);
    setActiveTab('full');
    setProgress({
      step1: { status: 'pending', message: 'Introduction', data: null },
      step2: { status: 'pending', message: 'Solution', data: null },
      step3: { status: 'pending', message: 'Impact & Values', data: null },
      step4: { status: 'pending', message: 'Final Composition', data: null }
    });
    setStreaming(false);
    setIsEditing(false);
    setEditedCaseStudy('');
    setCopySuccess(false);
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="step-icon completed" />;
      case 'processing':
        return <Loader2 className="step-icon processing spinning" />;
      case 'pending':
        return <Clock className="step-icon pending" />;
      default:
        return <Clock className="step-icon pending" />;
    }
  };

  const getStepStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'processing':
        return 'processing';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Sparkles className="logo-icon" />
            <h1>Tekrowe Case Study Generator</h1>
          </div>
          <p className="subtitle">Professional B2B Case Studies Generator</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Input Form */}
          <div className="form-section">
            <div className="form-header">
              <div className="form-header-left">
                <Building2 className="form-icon" />
                <h2>Project Information</h2>
              </div>
              <button
                onClick={resetToInitial}
                className="btn-reset"
                title="Reset to initial state"
              >
                <RotateCcw className="btn-icon" />
                Reset
              </button>
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
                onClick={generateCaseStudyStream}
                disabled={loading || streaming}
                className="btn btn-primary btn-centered"
              >
                {streaming ? (
                  <>
                    <Loader2 className="btn-icon spinning" />
                    Generating Case Study...
                  </>
                ) : (
                  <>
                    <Sparkles className="btn-icon" />
                    Generate Case Study
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Tracking */}
          {streaming && (
            <div className="progress-section">
              <div className="progress-header">
                <Target className="progress-icon" />
                <h3>Generation Progress</h3>
              </div>
              
              <div className="progress-steps">
                {Object.entries(progress).map(([key, step]) => (
                  <div key={key} className={`progress-step ${getStepStatusClass(step.status)}`}>
                    <div className="step-indicator">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="step-info">
                      <span className="step-title">{step.message}</span>
                      <span className="step-status">
                        {step.status === 'pending' && 'Waiting...'}
                        {step.status === 'processing' && 'In Progress...'}
                        {step.status === 'completed' && 'Completed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Case Study Output */}
          {caseStudy && caseStudy.full_case_study && (
            <div className="output-section">
              <div className="output-header">
                <div className="output-header-content">
                <Target className="output-icon" />
                <h2>Generated Case Study</h2>
                </div>
                <div className="output-actions">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveChanges}
                        className="btn-save"
                        title="Save changes"
                      >
                        <Save className="btn-icon" />
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="btn-cancel"
                        title="Cancel editing"
                      >
                        <X className="btn-icon" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startEditing}
                      className="btn btn-info btn-small"
                      title="Edit case study"
                    >
                      <Edit3 className="btn-icon" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={copyToClipboard}
                    className={`btn btn-secondary btn-small ${copySuccess ? 'btn-success' : ''}`}
                    title={`Copy ${activeTab === 'full' ? 'Full Case Study' : activeTab === 'intro' ? 'Introduction' : activeTab === 'solution' ? 'Solution' : 'Impact & Values'} to clipboard`}
                  >
                    {copySuccess ? <CheckCircle className="btn-icon" /> : <Copy className="btn-icon" />}
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={downloadCaseStudyWord}
                    className="btn btn-secondary btn-small"
                    title="Download as Word document"
                  >
                    <FileText className="btn-icon" />
                    Word
                  </button>
                  <button
                    onClick={downloadCaseStudyPDF}
                    className="btn btn-secondary btn-small"
                    title="Download as PDF"
                  >
                    <FileText className="btn-icon" />
                    PDF
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="tab-navigation">
                <button
                  className={`tab ${activeTab === 'full' ? 'active' : ''}`}
                  onClick={() => setActiveTab('full')}
                  disabled={!caseStudy.full_case_study}
                >
                  <FileText className="tab-icon" />
                  Full Case Study
                </button>
                <button
                  className={`tab ${activeTab === 'intro' ? 'active' : ''}`}
                  onClick={() => setActiveTab('intro')}
                  disabled={!caseStudy.introduction}
                >
                  <Target className="tab-icon" />
                  Introduction
                </button>
                <button
                  className={`tab ${activeTab === 'solution' ? 'active' : ''}`}
                  onClick={() => setActiveTab('solution')}
                  disabled={!caseStudy.solution}
                >
                  <Building2 className="tab-icon" />
                  Solution
                </button>
                <button
                  className={`tab ${activeTab === 'impact' ? 'active' : ''}`}
                  onClick={() => setActiveTab('impact')}
                  disabled={!caseStudy.impact_values}
                >
                  <TrendingUp className="tab-icon" />
                  Impact & Values
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'full' && caseStudy.full_case_study && (
                  <div className="markdown-content">
                    {isEditing ? (
                      <div className="editor-container">
                        <div className="editor-header">
                          <h3>Edit Case Study</h3>
                          <p>Make your changes below and click Save when done.</p>
                        </div>
                        <textarea
                          value={editedCaseStudy}
                          onChange={(e) => setEditedCaseStudy(e.target.value)}
                          className="case-study-editor"
                          placeholder="Edit your case study here..."
                        />
                      </div>
                    ) : (
                    <ReactMarkdown>{caseStudy.full_case_study}</ReactMarkdown>
                    )}
                  </div>
                )}
                {activeTab === 'full' && !caseStudy.full_case_study && (
                  <div className="markdown-content">
                    <div className="partial-content">
                      <h3>Case Study in Progress...</h3>
                      {caseStudy.introduction && (
                        <div className="partial-section">
                          <h4>📌 Introduction</h4>
                          <ReactMarkdown>{caseStudy.introduction}</ReactMarkdown>
                        </div>
                      )}
                      {caseStudy.solution && (
                        <div className="partial-section">
                          <h4>🛠️ Solution</h4>
                          <ReactMarkdown>{caseStudy.solution}</ReactMarkdown>
                        </div>
                      )}
                      {caseStudy.impact_values && (
                        <div className="partial-section">
                          <h4>📈 Impact & Values</h4>
                          <ReactMarkdown>{caseStudy.impact_values}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'intro' && caseStudy.introduction && (
                  <div className="markdown-content">
                    <ReactMarkdown>{caseStudy.introduction}</ReactMarkdown>
                  </div>
                )}
                {activeTab === 'solution' && caseStudy.solution && (
                  <div className="markdown-content">
                    <ReactMarkdown>{caseStudy.solution}</ReactMarkdown>
                  </div>
                )}
                {activeTab === 'impact' && caseStudy.impact_values && (
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
        <p>&copy; 2025 Tekrowe. Professional case study generation. Powered by Tekrowe.</p>
      </footer>
    </div>
  );
}

export default App;
