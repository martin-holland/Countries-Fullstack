import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";
import { DynamicTable } from "../DynamicTable";

// Backend API URL
const API_URL = "http://localhost:5001";

interface QueryResult {
  message?: string;
  sql?: string;
  data?: Record<string, unknown>[];
  error?: string;
}

export const AiQueryAssistant = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !user) return;

    setLoading(true);
    setConnectionError(null);

    try {
      // Get the session token from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(`${API_URL}/ai/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Server error (${response.status}): ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("AI query error:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          setConnectionError(
            "Could not connect to the AI service. Please check your network connection or try again later."
          );
        } else {
          setResult({
            error: `Failed to process your query: ${error.message}`,
          });
        }
      } else {
        setResult({
          error: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">
            Please log in to use the AI Query Assistant
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        AI Database Assistant
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Ask questions about countries or request specific data in natural
        language. The AI will generate SQL queries or provide answers directly.
      </Typography>

      {connectionError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {connectionError}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          label="Ask a question about countries data"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          rows={2}
          placeholder="Example: Show me the top 5 countries by population in Europe"
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !query.trim()}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? "Processing..." : "Ask AI Assistant"}
        </Button>
      </Paper>

      {result && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Response
            </Typography>
            <Typography variant="body1" paragraph>
              {result.message || "No message provided."}
            </Typography>

            {result.error && (
              <Typography color="error" variant="body2">
                Error: {result.error}
              </Typography>
            )}
          </Paper>

          {result.sql && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Generated SQL Query</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: "grey.900",
                    color: "grey.100",
                    fontFamily: "monospace",
                    overflowX: "auto",
                  }}
                >
                  <pre>{result.sql}</pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          )}

          {result.data && result.data.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Query Results
              </Typography>
              <DynamicTable data={result.data} />
            </Box>
          )}

          {result.data && result.data.length === 0 && (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body1">
                  The query executed successfully but returned no results.
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Example Questions
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                Which countries in Asia have a population over 100 million?
              </li>
              <li>What are the 5 smallest countries by area?</li>
              <li>How many users have saved Switzerland as a favorite?</li>
              <li>Which country has the most favorites?</li>
              <li>Show me all countries that use Euro as their currency</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
