import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  Checkbox as MuiCheckbox,
  ListItemText,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  CardActions,
  SelectChangeEvent,
} from "@mui/material";
import { FieldResponse } from "../../models/FieldData";

const EndUserForm: React.FC<EndUserFormProps> = ({ fields }) => {
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: string | string[];
  }>({});

  useEffect(() => {
    const initialValues: { [key: string]: string | string[] } = {};

    fields.forEach((field) => {
      if (field.isMultiSelect) {
        initialValues[field.id.toString()] = field.defaultValue
          ? [field.defaultValue]
          : [];
      } else {
        initialValues[field.id.toString()] = field.defaultValue || "";
      }
    });

    setSelectedValues(initialValues);
  }, [fields]);

  const handleSelectChange = (
    event: SelectChangeEvent<string[] | string>,
    fieldId: string
  ) => {
    const value = event.target.value;
    setSelectedValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const renderField = (field: FieldResponse) => {
    const sortedChoices =
      field.order === "alphabetical"
        ? [...field.choices].sort()
        : [...field.choices].sort().reverse();

    const selected =
      selectedValues[field.id.toString()] || (field.isMultiSelect ? [] : "");

    if (field.isMultiSelect) {
      return (
        <FormControl fullWidth margin="normal" key={field.id}>
          <InputLabel id={`${field.id}-label`}>{field.label}</InputLabel>
          <Select
            labelId={`${field.id}-label`}
            multiple
            value={selected as string[]}
            onChange={(event) => handleSelectChange(event, field.id.toString())}
            input={<OutlinedInput label={field.label} />}
            renderValue={(selected) => (selected as string[]).join(", ")}
          >
            {sortedChoices.map((choice) => (
              <MenuItem key={choice} value={choice}>
                <MuiCheckbox
                  checked={(selected as string[])?.includes(choice)}
                />
                <ListItemText primary={choice} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else {
      return (
        <FormControl fullWidth margin="normal" key={field.id}>
          <InputLabel id={`${field.id}-label`}>{field.label}</InputLabel>
          <Select
            labelId={`${field.id}-label`}
            value={selected as string}
            onChange={(event) => handleSelectChange(event, field.id.toString())}
            input={<OutlinedInput label={field.label} />}
          >
            {sortedChoices.map((choice) => (
              <MenuItem key={choice} value={choice}>
                {choice}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
  };

  if (fields.length === 0) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <CardHeader
        title={<span style={{ fontWeight: "bold" }}>End User Form</span>}
        sx={{
          textAlign: "left",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          padding: "16px",
          color: "black",
        }}
      />
      <CardContent sx={{ padding: 2 }}>
        <Grid container direction="column" alignItems="center">
          {fields.map(renderField)}
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", paddingX: 2 }}>
        <Button variant="contained" color="success">
          Submit
        </Button>
        <Button variant="contained" color="error">
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
};

interface EndUserFormProps {
  fields: FieldResponse[];
}

export default EndUserForm;
