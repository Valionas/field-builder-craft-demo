import React, { useState, useEffect } from "react";
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  FormControl,
  OutlinedInput,
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
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

import continents from "../../data/continents";
import { saveFieldData } from "../../services/fieldService";
import { FieldData } from "../../models/FieldData";

const LOCAL_STORAGE_KEY = "fieldBuilderData";

const FieldBuilder: React.FC<FieldBuilderProps> = ({ onSubmitSuccess }) => {
  const [label, setLabel] = useState<string>("");
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(true);
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [selectedChoiceOptions, setSelectedChoiceOptions] = useState<string[]>(
    []
  );
  const [choiceOptions, setChoiceOptions] = useState<string[]>(continents);
  const [order, setOrder] = useState<string>("alphabetical");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [errors, setErrors] = useState<FieldBuilderErrors>({
    labelRequired: false,
    noChoicesSelected: false,
    defaultValueTooLong: false,
    duplicateChoices: false,
    tooManyChoices: false,
    choiceTooLong: false,
  });

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedData) {
      const parsedData: FieldData = JSON.parse(savedData);

      setLabel(parsedData.label);
      setIsMultiSelect(parsedData.isMultiSelect);
      setDefaultValue(parsedData.defaultValue);
      setSelectedChoiceOptions(parsedData.choices);
      setOrder(parsedData.order);
    }
  }, []);

  useEffect(() => {
    if (label || selectedChoiceOptions.length > 0) {
      const formData: FieldData = {
        label,
        isMultiSelect,
        defaultValue,
        choices: selectedChoiceOptions,
        order,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [label, isMultiSelect, defaultValue, selectedChoiceOptions, order]);

  const validateForm = (): boolean => {
    const validationErrors: FieldBuilderErrors = {
      labelRequired: !label.trim(),
      noChoicesSelected: selectedChoiceOptions.length === 0,
      defaultValueTooLong: defaultValue.length > 40,
      duplicateChoices:
        new Set(selectedChoiceOptions).size !== selectedChoiceOptions.length,
      tooManyChoices: selectedChoiceOptions.length > 50,
      choiceTooLong: selectedChoiceOptions.some((choice) => choice.length > 40),
    };

    setErrors(validationErrors);

    return !Object.values(validationErrors).some(Boolean);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setIsSaving(true);

    const updatedChoices = [...selectedChoiceOptions];
    if (defaultValue && !updatedChoices.includes(defaultValue)) {
      updatedChoices.push(defaultValue);
    }

    const formData: FieldData = {
      label,
      isMultiSelect,
      defaultValue,
      choices: updatedChoices,
      order,
    };

    try {
      await saveFieldData(formData);
      console.log(formData);
      toast.success("Form data saved successfully!");
      onSubmitSuccess();
      setChoiceOptions([
        ...choiceOptions,
        ...updatedChoices.filter((choice) => !choiceOptions.includes(choice)),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save form data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLabel("");
    setIsMultiSelect(true);
    setDefaultValue("");
    setSelectedChoiceOptions([]);
    setChoiceOptions(continents);
    setOrder("alphabetical");
    setErrors({
      labelRequired: false,
      noChoicesSelected: false,
      defaultValueTooLong: false,
      duplicateChoices: false,
      tooManyChoices: false,
      choiceTooLong: false,
    });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.info("Form cleared.");
  };

  const handleChoicesChange = (event: SelectChangeEvent<string[] | string>) => {
    setSelectedChoiceOptions(event.target.value as string[]);
  };

  const removeChoice = (choiceToRemove: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const activeChoices = choiceOptions.filter((choice) => choice.length <= 40);

    if (activeChoices.length <= 1 && activeChoices.includes(choiceToRemove)) {
      toast.error("Cannot delete the last active choice option.");
      return;
    }

    const updatedChoices = choiceOptions.filter(
      (choice) => choice !== choiceToRemove
    );
    setChoiceOptions(updatedChoices);

    setSelectedChoiceOptions((prevSelectedChoices) =>
      prevSelectedChoices.filter((choice) => choice !== choiceToRemove)
    );
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ height: "100%", width: "100%" }}
    >
      <Grid item xs={12}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            width: "100%",
            height: "100%",
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
          <CardContent sx={{ maxHeight: "400px", overflowY: "auto" }}>
            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "center", sm: "left" }}
                >
                  Label:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  fullWidth
                  error={errors.labelRequired}
                  helperText={errors.labelRequired ? "*Label is required." : ""}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              marginBottom={2}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Grid item xs={6} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "right", sm: "left" }}
                >
                  Type:
                </Typography>
              </Grid>
              <Grid item xs={6} sm={8}>
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
                  Default Value:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  fullWidth
                  error={defaultValue.length > 40}
                  helperText={
                    defaultValue.length > 40
                      ? "*Default value exceeds 40 characters."
                      : ""
                  }
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "center", sm: "left" }}
                >
                  Choices:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth>
                  <InputLabel id="choices-label">Choices</InputLabel>
                  <Select
                    labelId="choices-label"
                    multiple
                    value={selectedChoiceOptions}
                    onChange={handleChoicesChange}
                    input={<OutlinedInput label="Choices" />}
                    renderValue={(selected) => {
                      if (Array.isArray(selected)) {
                        return selected.join(", ");
                      }
                      return "";
                    }}
                    error={
                      errors.noChoicesSelected ||
                      errors.choiceTooLong ||
                      errors.tooManyChoices
                    }
                  >
                    {choiceOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox
                          checked={selectedChoiceOptions.indexOf(option) > -1}
                        />
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
                  {errors.noChoicesSelected && (
                    <Typography color="error" variant="caption">
                      *At least one option must be selected.
                    </Typography>
                  )}
                  {errors.choiceTooLong && (
                    <Typography color="error" variant="caption">
                      *Choices cannot exceed 40 characters.
                    </Typography>
                  )}
                  {errors.tooManyChoices && (
                    <Typography color="error" variant="caption">
                      *You cannot choose more than 50 choices.
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="body1"
                  textAlign={{ xs: "center", sm: "left" }}
                >
                  Order:
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
      </Grid>
    </Grid>
  );
};

interface FieldBuilderErrors {
  labelRequired: boolean;
  noChoicesSelected: boolean;
  defaultValueTooLong: boolean;
  duplicateChoices: boolean;
  tooManyChoices: boolean;
  choiceTooLong: boolean;
}

interface FieldBuilderProps {
  onSubmitSuccess: () => void;
}

export default FieldBuilder;
