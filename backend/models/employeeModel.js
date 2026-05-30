const mongoose = require('mongoose');

const certificationMetaSchema = new mongoose.Schema({
  verified: { type: Boolean, default: false },
  lastUpdated: { type: String }
});

const certificationsSchema = new mongoose.Schema({
  current: [String],
  expired: [String],
  meta: certificationMetaSchema
});

const experienceSchema = new mongoose.Schema({
  years: { type: Number, default: 0 },
  domains: [String],
  certifications: certificationsSchema
});

const skillsSchema = new mongoose.Schema({
  primary: { type: String },
  secondary: [String],
  experience: experienceSchema
});

const assignmentSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  skills: skillsSchema
});

const taskSchema = new mongoose.Schema({
  taskId: { type: String },
  description: { type: String },
  assignedTo: assignmentSchema
});

const projectSchema = new mongoose.Schema({
  projectId: { type: String },
  name: { type: String },
  tasks: [taskSchema]
});

const employeeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String },
    role: { type: String, default: 'Employee' },
    profile: {
      contact: {
        email: { type: String, required: true, unique: true },
        phone: { type: String }
      },
      address: {
        street: { type: String },
        city: { type: String },
        location: {
          state: { type: String },
          country: { type: String }
        },
        geo: {
          lat: { type: String },
          long: { type: String }
        },
        timezone: {
          name: { type: String },
          utc_offset: { type: String }
        }
      },
      projects: [projectSchema]
    }
  },
  {
    timestamps: true
  }
);

employeeSchema.index({ name: 1 });
employeeSchema.index({ 'profile.contact.email': 1 });
employeeSchema.index({ 'profile.projects.tasks.assignedTo.skills.primary': 1 });
employeeSchema.index({ 'profile.address.location.country': 1 });
employeeSchema.index({ 'profile.projects.tasks.assignedTo.skills.experience.years': -1 });

module.exports = mongoose.model('Employee', employeeSchema);
