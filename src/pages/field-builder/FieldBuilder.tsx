import React, { useState, useEffect } from "react";
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
  Grid,
  InputLabel,
  ListItemText,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import continents from "../../data/continents";
import { saveFieldData } from "../../services/fieldService";
import { FieldData } from "../../models/FieldData";

const LOCAL_STORAGE_KEY = "fieldBuilderData";

const FieldBuilder: React.FC = () => {
  const [label, setLabel] = useState<string>("");
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(true);
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [selectedChoiceOptions, setSelectedChoiceOptions] = useState<string[]>(
    []
  );
  const [choiceOptions, setChoiceOptions] = useState<string[]>(continents);
  const [order, setOrder] = useState<string>("alphabetical");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const parsedData: FieldData = JSON.parse(savedData);
      setLabel(parsedData.label);
      setIsMultiSelect(parsedData.isMultiSelect);
      setDefaultValue(parsedData.defaultValue);
      setSelectedChoiceOptions(parsedData.choices);

      setChoiceOptions(
        parsedData.defaultValue &&
          !parsedData.choices.includes(parsedData.defaultValue)
          ? [...continents, parsedData.defaultValue]
          : continents
      );
      setOrder(parsedData.order);
    }
  }, []);

  useEffect(() => {
    const formData: FieldData = {
      label,
      isMultiSelect,
      defaultValue,
      choices: selectedChoiceOptions,
      order,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [label, isMultiSelect, defaultValue, selectedChoiceOptions, order]);

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];

    if (!label.trim()) {
      validationErrors.push("Label is required.");
    }

    const uniqueChoices = new Set(selectedChoiceOptions);
    if (uniqueChoices.size !== selectedChoiceOptions.length) {
      validationErrors.push("Duplicate choices are not allowed.");
    }

    if (selectedChoiceOptions.length > 50) {
      validationErrors.push("There cannot be more than 50 choices.");
    }

    selectedChoiceOptions.forEach((choice) => {
      if (choice.length > 40) {
        validationErrors.push(`Choice "${choice}" exceeds 40 characters.`);
      }
    });

    if (defaultValue && !selectedChoiceOptions.includes(defaultValue)) {
      setSelectedChoiceOptions([...selectedChoiceOptions, defaultValue]);
    }

    setErrors(validationErrors);

    return validationErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setIsSaving(true); // Start loading

    const formData: FieldData = {
      label,
      isMultiSelect,
      defaultValue,
      choices: selectedChoiceOptions,
      order,
    };

    try {
      const responseData = await saveFieldData(formData);
      console.log("Form data posted successfully:", responseData);
      toast.success("Form data saved successfully!");

      // Add defaultValue to choiceOptions if it's not already there
      if (defaultValue && !choiceOptions.includes(defaultValue)) {
        setChoiceOptions([...choiceOptions, defaultValue]);
      }
    } catch (error) {
      console.error("Failed to post form data:", error);
      toast.error("Failed to save form data.");
    } finally {
      setIsSaving(false); // End loading
    }

    console.log("Form data saved:", formData);
  };

  const handleClear = () => {
    setLabel("");
    setIsMultiSelect(true);
    setDefaultValue("");
    setSelectedChoiceOptions([]);
    setChoiceOptions(continents);
    setOrder("alphabetical");
    setErrors([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.info("Form cleared.");
  };

  const handleChoicesChange = (event: SelectChangeEvent<string[] | string>) => {
    const value = event.target.value;
    if (isMultiSelect) {
      setSelectedChoiceOptions(value as string[]);
    } else {
      const selectedValue = value as string;
      setSelectedChoiceOptions([selectedValue]);
      setDefaultValue(selectedValue); // Update defaultValue with the selected option
    }

    // Reset default value if it's removed from the choices
    if (defaultValue && Array.isArray(value) && !value.includes(defaultValue)) {
      setDefaultValue("");
    }
  };

  const removeChoice = (choiceToRemove: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (selectedChoiceOptions.length <= 1) {
      toast.error("Cannot remove the last choice option.");
      return;
    }

    const updatedChoices = choiceOptions.filter(
      (choice) => choice !== choiceToRemove
    );
    setChoiceOptions(updatedChoices);

    if (updatedChoices.length === 0) {
      setDefaultValue("");
      setErrors(["All choices have been removed. Please add choices."]);
    }
  };

  const renderChoice = (choice: string) => (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item xs>
        <Typography noWrap>
          {choice.length > 40 ? (
            <>
              {choice.slice(0, 40)}
              <span style={{ color: "red" }}>{choice.slice(40)}</span>
            </>
          ) : (
            choice
          )}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton
          size="small"
          onClick={(event) => removeChoice(choice, event)}
          sx={{ marginLeft: 1 }}
        >
          <FaTimes fontSize="small" />
        </IconButton>
      </Grid>
    </Grid>
  );

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: "100vh" }}
    >
      <Grid item xs={12} sm={8} md={6}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <CardHeader
            title={
              <Typography variant="h6" fontWeight="bold">
                Field Builder
              </Typography>
            }
            sx={{
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #ddd",
              padding: "16px",
              color: "black",
            }}
          />
          <CardContent>
            {errors.length > 0 && (
              <Grid container justifyContent="center" marginBottom={2}>
                {errors.map((error, index) => (
                  <Typography key={index} color="error">
                    {error}
                  </Typography>
                ))}
              </Grid>
            )}
            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "center", sm: "left" }}
                >
                  Label
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  fullWidth
                  error={errors.includes("Label is required.")}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "center", sm: "left" }}
                >
                  Type
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isMultiSelect}
                      onChange={(e) => setIsMultiSelect(e.target.checked)}
                    />
                  }
                  label="Multi-select"
                  sx={{ textAlign: { xs: "center", sm: "left" } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "center", sm: "left" }}
                >
                  Default Value
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  fullWidth
                />
                {defaultValue.length > 40 && (
                  <Typography color="error" variant="caption">
                    Default value exceeds 40 characters.
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "center", sm: "left" }}
                >
                  Choices
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth>
                  <InputLabel id="choices-label">Choices</InputLabel>
                  <Select
                    labelId="choices-label"
                    multiple={isMultiSelect}
                    value={
                      isMultiSelect
                        ? selectedChoiceOptions
                        : selectedChoiceOptions[0] || ""
                    }
                    onChange={handleChoicesChange}
                    input={<OutlinedInput label="Choices" />}
                    renderValue={(selected) =>
                      Array.isArray(selected)
                        ? selected.map(renderChoice).join(", ")
                        : selected
                    }
                  >
                    {choiceOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {isMultiSelect && (
                          <MuiCheckbox
                            checked={selectedChoiceOptions.indexOf(option) > -1}
                          />
                        )}
                        <ListItemText
                          primary={option}
                          secondary={
                            option.length > 40
                              ? `${option.length - 40} characters over limit`
                              : undefined
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={(event) => removeChoice(option, event)}
                          sx={{ marginLeft: 1 }}
                        >
                          <FaTimes fontSize="small" />
                        </IconButton>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "center", sm: "left" }}
                >
                  Order
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
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
          </CardContent>
          <CardActions sx={{ justifyContent: "space-between", paddingX: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={isSaving}
              startIcon={
                isSaving ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : null
              }
            >
              Save changes
            </Button>
            <Button variant="contained" color="error" onClick={handleClear}>
              Cancel
            </Button>
          </CardActions>
        </Card>
        <ToastContainer />
      </Grid>
    </Grid>
  );
};

export default FieldBuilder;
