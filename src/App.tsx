import React, { useState, useEffect } from "react";
import { Grid, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import FieldBuilder from "./pages/field-builder/FieldBuilder";
import EndUserForm from "./pages/end-user-form/EndUserForm";
import { FieldResponse } from "./models/FieldData";
import { getFields } from "./services/fieldService"; // Import the new function

const App: React.FC = () => {
  const [fields, setFields] = useState<FieldResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialAnimation, setInitialAnimation] = useState<boolean>(true);

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
    fetchFields().then(() => {
      setTimeout(() => {
        setInitialAnimation(false);
      }, 1500);
    }); // Initial fetch of fields when the component mounts
  }, []);

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} md={loading && fields.length === 0 ? 7 : 5}>
        <motion.div
          initial={initialAnimation ? { x: -200, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <FieldBuilder onSubmitSuccess={fetchFields} />
        </motion.div>
      </Grid>
      {fields.length !== 0 ? (
        <Grid item xs={12} md={5}>
          <motion.div
            initial={initialAnimation ? { x: 200, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <EndUserForm fields={fields} />
          </motion.div>
        </Grid>
      ) : (
        loading && (
          <Grid item xs={12} md={5}>
            <Grid container justifyContent="center" alignItems="center">
              <CircularProgress size={40} />
            </Grid>
          </Grid>
        )
      )}
    </Grid>
  );
};

export default App;
