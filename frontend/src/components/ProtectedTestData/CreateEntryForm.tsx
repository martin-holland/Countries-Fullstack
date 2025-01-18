import { Alert, Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import { supabase } from "../../config/supabase";

interface CreateEntryFormProps {
  onSuccess: () => void;
}

export const CreateEntryForm = ({ onSuccess }: CreateEntryFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("protected_data")
        .insert([
          {
            name,
            description,
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;

      // Clear form
      setName("");
      setDescription("");

      // Refresh the data
      onSuccess();
    } catch (err) {
      console.error("Error creating entry:", err);
      const error = err as { message?: string; code?: string };
      let errorMessage = "An error occurred";

      if (error.code === "42501") {
        errorMessage =
          "Authentication error. Please try logging out and back in.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 400,
        mb: 4,
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isSubmitting}
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
        disabled={isSubmitting}
      />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Entry"}
      </Button>
    </Box>
  );
};
