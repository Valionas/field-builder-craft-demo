import React, { useState } from "react";
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  FormControl,
  OutlinedInput,
  Checkbox as MuiCheckbox,
  MenuItem,
  Select,
  SelectChangeEvent,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Box,
  Grid,
  InputLabel,
  ListItemText,
  Typography,
} from "@mui/material";
import continents from "../../data/continents";
import { saveFieldData } from "../../services/fieldService";
import { FieldData } from "../../models/FieldData";

const FieldBuilder: React.FC = () => {
  const [label, setLabel] = useState<string>("");
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(true);
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [choices, setChoices] = useState<string[]>([]);
  const [order, setOrder] = useState<string>("alphabetical");
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];

    if (!label.trim()) {
      validationErrors.push("Label is required.");
    }

    const uniqueChoices = new Set(choices);
    if (uniqueChoices.size !== choices.length) {
      validationErrors.push("Duplicate choices are not allowed.");
    }

    if (choices.length > 50) {
      validationErrors.push("There cannot be more than 50 choices.");
    }

    if (defaultValue && !choices.includes(defaultValue)) {
      setChoices([...choices, defaultValue]);
    }

    setErrors(validationErrors);

    return validationErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const formData: FieldData = {
      label,
      isMultiSelect,
      defaultValue,
      choices,
      order,
    };

    try {
      const responseData = await saveFieldData(formData);
      console.log("Form data posted successfully:", responseData);
    } catch (error) {
      console.error("Failed to post form data:", error);
    }

    console.log("Form data saved:", formData);
  };

  const handleClear = () => {
    setLabel("");
    setIsMultiSelect(true);
    setDefaultValue("");
    setChoices([]);
    setOrder("alphabetical");
    setErrors([]);
  };

  const handleChoicesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setChoices(value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "60%",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <CardHeader
          title={<span style={{ fontWeight: "bold" }}>Field Builder</span>}
          sx={{
            textAlign: "left",
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #ddd",
            padding: "16px",
            color: "black",
          }}
        />
        <CardContent>
          {errors.length > 0 && (
            <Box sx={{ marginBottom: 2 }}>
              {errors.map((error, index) => (
                <Typography key={index} color="error">
                  {error}
                </Typography>
              ))}
            </Box>
          )}
          <Box component="form" noValidate autoComplete="off">
            <Grid container alignItems="center" spacing={2} marginBottom={2}>
              <Grid item xs={4}>
                <Typography variant="body1">Label</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  fullWidth
                  error={errors.includes("Label is required.")}
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2} marginBottom={2}>
              <Grid item xs={4}>
                <Typography variant="body1">Type</Typography>
              </Grid>
              <Grid item xs={8} display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isMultiSelect}
                      onChange={(e) => setIsMultiSelect(e.target.checked)}
                    />
                  }
                  label="Multi-select"
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2} marginBottom={2}>
              <Grid item xs={4}>
                <Typography variant="body1">Default Value</Typography>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2} marginBottom={2}>
              <Grid item xs={4}>
                <Typography variant="body1">Choices</Typography>
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <InputLabel id="choices-label">Choices</InputLabel>
                  <Select
                    labelId="choices-label"
                    multiple={isMultiSelect}
                    value={choices}
                    onChange={handleChoicesChange}
                    input={<OutlinedInput label="Choices" />}
                    renderValue={(selected) =>
                      Array.isArray(selected) ? selected.join(", ") : selected
                    }
                  >
                    {continents.map((continent) => (
                      <MenuItem key={continent} value={continent}>
                        {isMultiSelect && (
                          <MuiCheckbox
                            checked={choices.indexOf(continent) > -1}
                          />
                        )}
                        <ListItemText primary={continent} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={2} marginBottom={2}>
              <Grid item xs={4}>
                <Typography variant="body1">Order</Typography>
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <InputLabel id="order-label">Order</InputLabel>
                  <Select
                    labelId="order-label"
                    value={order}
                    onChange={(e) => setOrder(e.target.value as string)}
                    input={<OutlinedInput label="Order" />}
                  >
                    <MenuItem value="alphabetical">
                      Display choices in Alphabetical
                    </MenuItem>
                    <MenuItem value="reverse-alphabetical">
                      Reverse Alphabetical
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", paddingX: 2 }}>
          <Button variant="contained" color="success" onClick={handleSave}>
            Save changes
          </Button>
          <Button variant="text" color="error" onClick={handleClear}>
            Cancel
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default FieldBuilder;
