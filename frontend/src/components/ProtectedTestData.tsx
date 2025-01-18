import { Alert, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { TestData } from "../types/test";
import { DynamicTable } from "./DynamicTable";
import { CreateEntryForm } from "./ProtectedTestData/CreateEntryForm";

export const ProtectedTestData = () => {
  const [data, setData] = useState<TestData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProtectedData = async () => {
    try {
      const { data: protectedData, error } = await supabase
        .from("protected_data")
        .select("*");

      if (error) throw error;
      setData(protectedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtectedData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        Protected Test Data
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        This data is only visible to authenticated users
      </Typography>

      <CreateEntryForm onSuccess={fetchProtectedData} />

      {data.length > 0 ? (
        <DynamicTable data={data} />
      ) : (
        <Alert severity="info">
          No protected data available. Create some entries above!
        </Alert>
      )}
    </Box>
  );
};
