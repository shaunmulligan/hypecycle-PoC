import { tableSchema } from "@nozbe/watermelondb";

export const sensorSchema = tableSchema({
  name: "sensors",
  columns: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "address",
      type: "string",
    },
    {
      name: "type",
      type: "string"
    },
    {
      name: "services",
      type: "string"
    },
    {
      name: "created_at",
      type: "number",
    },
  ],
});
