import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
	{
		machineName: {
			type: String,
			required: true,
		},
		urlFor404Api: {
			type: String,
			required: true,
		},
		localIpAddress: {
			type: String,
			required: true,
		},
		userHomeDir: {
			type: String,
		},
		nginxStoragePathOptions: [
			{
				type: String,
			},
		],
	},
	{
		timestamps: true, // Automatically adds createdAt and updatedAt
	}
);

export const Machine = mongoose.model("Machine", machineSchema);
