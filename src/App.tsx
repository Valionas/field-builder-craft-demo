import React, { useState, useEffect } from "react";
import { Grid, CircularProgress, Typography } from "@mui/material";
import FieldBuilder from "./pages/field-builder/FieldBuilder";
import EndUserForm from "./pages/end-user-form/EndUserForm";
import { FieldResponse } from "./models/FieldData";
import { getFields } from "./services/fieldService"; // Import the new function

const App: React.FC = () => {
  const [fields, setFields] = useState<FieldResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const data = await getFields(); // Use the getFields function
      setFields(data);
    } catch (error) {
      console.error("Failed to fetch fields:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields(); // Initial fetch of fields when the component mounts
  }, []);

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={5}>
        <FieldBuilder onSubmitSuccess={fetchFields} />
      </Grid>
      <Grid item xs={12} md={5}>
        {loading ? (
          <Grid container justifyContent="center" alignItems="center">
            <CircularProgress />
            <Typography variant="body1" sx={{ marginLeft: 2 }}>
              Loading fields...
            </Typography>
          </Grid>
        ) : (
          <EndUserForm fields={fields} />
        )}
      </Grid>
    </Grid>
  );
};

export default App;
