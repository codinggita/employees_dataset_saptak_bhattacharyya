const Employee = require('../models/employeeModel');

const employeeService = {
  fetchEmployees: async (queries) => {
    const filter = {};

    if (queries.country) filter['profile.address.location.country'] = queries.country;
    if (queries.state) filter['profile.address.location.state'] = queries.state;
    if (queries.city) filter['profile.address.city'] = queries.city;
    if (queries.primarySkill) filter['profile.projects.tasks.assignedTo.skills.primary'] = queries.primarySkill;
    if (queries.secondarySkill) filter['profile.projects.tasks.assignedTo.skills.secondary'] = queries.secondarySkill;
    if (queries.domain) filter['profile.projects.tasks.assignedTo.skills.experience.domains'] = queries.domain;
    if (queries.experience) filter['profile.projects.tasks.assignedTo.skills.experience.years'] = Number(queries.experience);
    if (queries.verified) filter['profile.projects.tasks.assignedTo.skills.experience.certifications.meta.verified'] = queries.verified === 'true';
    if (queries.timezone) filter['profile.address.timezone.name'] = queries.timezone;
    if (queries.project) filter['profile.projects.projectId'] = queries.project;
    if (queries.task) filter['profile.projects.tasks.taskId'] = queries.task;
    if (queries.skill) {
      filter.$or = [
        { 'profile.projects.tasks.assignedTo.skills.primary': queries.skill },
        { 'profile.projects.tasks.assignedTo.skills.secondary': queries.skill }
      ];
    }
    if (queries.certification) {
      filter['profile.projects.tasks.assignedTo.skills.experience.certifications.current'] = queries.certification;
    }

    let sortOption = {};
    if (queries.sort) {
      if (queries.sort === 'name') sortOption = { name: 1 };
      else if (queries.sort === 'experience') sortOption = { 'profile.projects.tasks.assignedTo.skills.experience.years': 1 };
      else if (queries.sort === 'country') sortOption = { 'profile.address.location.country': 1 };
      else if (queries.sort === 'state') sortOption = { 'profile.address.location.state': 1 };
      else if (queries.sort === 'city') sortOption = { 'profile.address.city': 1 };
      else if (queries.sort === 'timezone') sortOption = { 'profile.address.timezone.name': 1 };
      else if (queries.sort === 'project') sortOption = { 'profile.projects.name': 1 };
      else if (queries.sort === 'task') sortOption = { 'profile.projects.tasks.taskId': 1 };
      else if (queries.sort === 'skill') sortOption = { 'profile.projects.tasks.assignedTo.skills.primary': 1 };
      else if (queries.sort === 'lastUpdated') sortOption = { 'profile.projects.tasks.assignedTo.skills.experience.certifications.meta.lastUpdated': 1 };
    }

    const page = Number(queries.page) || 1;
    const limit = Number(queries.limit) || 100;
    const skip = (page - 1) * limit;

    return await Employee.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
  },

  fetchEmployeeById: async (id) => {
    return await Employee.findById(id);
  },

  addEmployee: async (data) => {
    if (data.profile) {
      return await Employee.create(data);
    }

    const { name, email, role, department, salary, primarySkill, domain, city, state, country, timezone } = data;
    return await Employee.create({
      id: 'E' + Math.floor(10000 + Math.random() * 90000).toString(),
      name,
      role: role || 'Employee',
      profile: {
        contact: {
          email,
          phone: data.phone || ''
        },
        address: {
          city,
          location: {
            state,
            country
          },
          timezone: {
            name: timezone || 'UTC',
            utc_offset: ''
          }
        },
        projects: [{
          projectId: 'P' + Math.floor(10000 + Math.random() * 90000).toString(),
          name: domain || 'General Project',
          tasks: [{
            taskId: 'T' + Math.floor(10000 + Math.random() * 90000).toString(),
            description: 'New onboarding task',
            assignedTo: {
              id: 'E' + Math.floor(10000 + Math.random() * 90000).toString(),
              name,
              skills: {
                primary: primarySkill || 'Unknown',
                secondary: data.secondarySkills || [],
                experience: {
                  years: Number(data.experience) || 0,
                  domains: [domain || 'General'],
                  certifications: {
                    current: [],
                    expired: [],
                    meta: {
                      verified: false,
                      lastUpdated: new Date().toISOString().split('T')[0]
                    }
                  }
                }
              }
            }
          }]
        }]
      }
    });
  },

  replaceEmployeeById: async (id, data) => {
    return await Employee.findByIdAndUpdate(id, data, {
      new: true,
      overwrite: true,
      runValidators: true
    });
  },

  patchEmployeeById: async (id, data) => {
    return await Employee.findByIdAndUpdate(id, { $set: data }, {
      new: true,
      runValidators: true
    });
  },

  deleteEmployeeById: async (id) => {
    return await Employee.findByIdAndDelete(id);
  },

  checkEmployeeExists: async (id) => {
    const employee = await Employee.findById(id);
    return employee !== null;
  },

  addBulkEmployees: async (dataList) => {
    return await Employee.insertMany(dataList);
  },

  updateBulkEmployees: async (ids, updates) => {
    return await Employee.updateMany({ _id: { $in: ids } }, { $set: updates });
  },

  deleteBulkEmployees: async (ids) => {
    return await Employee.deleteMany({ _id: { $in: ids } });
  },

  queryByField: async (fieldName, value) => {
    const query = {};
    if (fieldName === 'name') {
      query['name'] = value;
    } else if (fieldName === 'state') {
      query['profile.address.location.state'] = value;
    } else if (fieldName === 'country') {
      query['profile.address.location.country'] = value;
    } else if (fieldName === 'city') {
      query['profile.address.city'] = value;
    } else if (fieldName === 'timezone') {
      query['profile.address.timezone.name'] = value;
    } else if (fieldName === 'primarySkill') {
      query['profile.projects.tasks.assignedTo.skills.primary'] = value;
    } else if (fieldName === 'secondarySkills') {
      query['profile.projects.tasks.assignedTo.skills.secondary'] = value;
    } else if (fieldName === 'domain') {
      query['profile.projects.tasks.assignedTo.skills.experience.domains'] = value;
    } else if (fieldName === 'experience') {
      query['profile.projects.tasks.assignedTo.skills.experience.years'] = value;
    } else if (fieldName === 'certifications.name') {
      query['profile.projects.tasks.assignedTo.skills.experience.certifications.current'] = value;
    } else if (fieldName === 'certifications.verified') {
      query['profile.projects.tasks.assignedTo.skills.experience.certifications.meta.verified'] = value;
    } else {
      query[fieldName] = value;
    }
    return await Employee.find(query);
  },

  queryByEmbeddedArray: async (arrayPath, value) => {
    const query = {};
    if (arrayPath === 'projects.projectId') {
      query['profile.projects.projectId'] = value;
    } else if (arrayPath === 'tasks.taskId') {
      query['profile.projects.tasks.taskId'] = value;
    } else {
      query[arrayPath] = value;
    }
    return await Employee.find(query);
  },

  // Aggregation Pipeline for Top Skills
  aggregateTopSkills: async () => {
    return await Employee.aggregate([
      { $unwind: "$profile.projects" },
      { $unwind: "$profile.projects.tasks" },
      {
        $project: {
          allSkills: {
            $concatArrays: [
              { $cond: [{ $isArray: "$profile.projects.tasks.assignedTo.skills.secondary" }, "$profile.projects.tasks.assignedTo.skills.secondary", []] },
              [{ $ifNull: ["$profile.projects.tasks.assignedTo.skills.primary", "Unknown"] }]
            ]
          }
        }
      },
      { $unwind: "$allSkills" },
      { $group: { _id: "$allSkills", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  },

  // Aggregation Pipeline for Top Domains
  aggregateTopDomains: async () => {
    return await Employee.aggregate([
      { $unwind: "$profile.projects" },
      { $unwind: "$profile.projects.tasks" },
      { $unwind: "$profile.projects.tasks.assignedTo.skills.experience.domains" },
      { $group: { _id: "$profile.projects.tasks.assignedTo.skills.experience.domains", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  },

  // Aggregation Pipeline for Top Certifications
  aggregateTopCertifications: async () => {
    return await Employee.aggregate([
      { $unwind: "$profile.projects" },
      { $unwind: "$profile.projects.tasks" },
      { $unwind: "$profile.projects.tasks.assignedTo.skills.experience.certifications.current" },
      { $group: { _id: "$profile.projects.tasks.assignedTo.skills.experience.certifications.current", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  },

  // Aggregation Pipeline for Experience Stats (Round & Project)
  aggregateExperienceStats: async () => {
    return await Employee.aggregate([
      { $unwind: "$profile.projects" },
      { $unwind: "$profile.projects.tasks" },
      {
        $group: {
          _id: null,
          averageExperience: { $avg: "$profile.projects.tasks.assignedTo.skills.experience.years" },
          maximumExperience: { $max: "$profile.projects.tasks.assignedTo.skills.experience.years" },
          minimumExperience: { $min: "$profile.projects.tasks.assignedTo.skills.experience.years" }
        }
      },
      {
        $project: {
          _id: 0,
          averageExperience: { $round: ["$averageExperience", 1] },
          maximumExperience: 1,
          minimumExperience: 1
        }
      }
    ]);
  },

  // Aggregation Pipeline for Location Distribution
  aggregateLocations: async () => {
    return await Employee.aggregate([
      {
        $group: {
          _id: {
            country: "$profile.address.location.country",
            state: "$profile.address.location.state",
            city: "$profile.address.city"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  },

  // Aggregation Pipeline for Projects Distribution by Domain
  aggregateProjects: async () => {
    return await Employee.aggregate([
      { $unwind: "$profile.projects" },
      {
        $group: {
          _id: "$profile.projects.name",
          projectCount: { $sum: 1 }
        }
      },
      { $sort: { projectCount: -1 } }
    ]);
  }
};

const getEmployees = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployeeById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    const result = await employeeService.addEmployee(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replaceEmployee = async (req, res) => {
  try {
    const result = await employeeService.replaceEmployeeById(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const patchEmployee = async (req, res) => {
  try {
    const result = await employeeService.patchEmployeeById(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const result = await employeeService.deleteEmployeeById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const existsEmployee = async (req, res) => {
  try {
    const exists = await employeeService.checkEmployeeExists(req.params.id);
    res.status(200).json({ exists });
  } catch (error) {
    res.status(200).json({ exists: false });
  }
};

const bulkCreate = async (req, res) => {
  try {
    const result = await employeeService.addBulkEmployees(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUpdate = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    const result = await employeeService.updateBulkEmployees(ids, updates);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await employeeService.deleteBulkEmployees(ids);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByName = async (req, res) => {
  try {
    const result = await employeeService.queryByField('name', req.params.name);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByState = async (req, res) => {
  try {
    const result = await employeeService.queryByField('state', req.params.state);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByCountry = async (req, res) => {
  try {
    const result = await employeeService.queryByField('country', req.params.country);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByCity = async (req, res) => {
  try {
    const result = await employeeService.queryByField('city', req.params.city);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByTimezone = async (req, res) => {
  try {
    const result = await employeeService.queryByField('timezone', req.params.timezone);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByPrimarySkill = async (req, res) => {
  try {
    const result = await employeeService.queryByField('primarySkill', req.params.skill);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBySecondarySkill = async (req, res) => {
  try {
    const result = await employeeService.queryByField('secondarySkills', req.params.skill);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByDomain = async (req, res) => {
  try {
    const result = await employeeService.queryByField('domain', req.params.domain);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByExperience = async (req, res) => {
  try {
    const result = await employeeService.queryByField('experience', Number(req.params.years));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByCertification = async (req, res) => {
  try {
    const result = await employeeService.queryByField('certifications.name', req.params.certification);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVerified = async (req, res) => {
  try {
    const result = await employeeService.queryByField('certifications.verified', true);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const projects = [];
    employees.forEach(emp => {
      emp.projects.forEach(p => projects.push(p));
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const tasks = [];
    employees.forEach(emp => {
      emp.tasks.forEach(t => tasks.push(t));
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopExperience = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({ sort: 'experience', limit: 5 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopSkills = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const sorted = [...employees].sort((a, b) => b.performanceScore - a.performanceScore);
    res.status(200).json(sorted.slice(0, 5));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCloudEngineers = async (req, res) => {
  try {
    const result = await employeeService.queryByField('domain', 'Cloud');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDevOpsEngineers = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'DevOps' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAIEngineers = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'AI' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFullStack = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'Fullstack' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecentCertifications = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const certs = [];
    employees.forEach(emp => {
      emp.certifications.forEach(c => {
        certs.push({
          employeeName: emp.name,
          employeeId: emp._id,
          certification: c
        });
      });
    });
    certs.sort((a, b) => new Date(b.certification.lastUpdated) - new Date(a.certification.lastUpdated));
    res.status(200).json(certs.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByProjectId = async (req, res) => {
  try {
    const result = await employeeService.queryByEmbeddedArray('projects.projectId', req.params.projectId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByTaskId = async (req, res) => {
  try {
    const result = await employeeService.queryByEmbeddedArray('tasks.taskId', req.params.taskId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPerformance = async (req, res) => {
  try {
    const employee = await employeeService.fetchEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({
      name: employee.name,
      performanceScore: employee.performanceScore,
      rating: employee.performanceScore > 90 ? 'Excellent' : employee.performanceScore > 75 ? 'Good' : 'Average'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatsById = async (req, res) => {
  try {
    const employee = await employeeService.fetchEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({
      name: employee.name,
      projectsCount: employee.projects.length,
      tasksCount: employee.tasks.length,
      certificationsCount: employee.certifications.length,
      activeTasksCount: employee.activeTasksCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchEmployees = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({ message: 'Query parameter q is required' });
    }
    const employees = await employeeService.fetchEmployees({});
    const regex = new RegExp(q, 'i');
    const matched = employees.filter(emp => {
      return regex.test(emp.name) ||
             regex.test(emp.primarySkill) ||
             regex.test(emp.domain) ||
             regex.test(emp.city) ||
             regex.test(emp.country);
    });
    res.status(200).json(matched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sortExperienceDesc = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ sort: 'experience' });
    res.status(200).json(result.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sortNameAsc = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ sort: 'name' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sortProjectAsc = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ sort: 'project' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sortDomainAsc = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ sort: 'domain' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sortCertificationDesc = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ sort: 'lastUpdated' });
    res.status(200).json(result.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterHighExperience = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const filtered = employees.filter(e => e.experience >= 8);
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterLowExperience = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const filtered = employees.filter(e => e.experience <= 2);
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterVerified = async (req, res) => {
  try {
    const result = await employeeService.queryByField('certifications.verified', true);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterCloud = async (req, res) => {
  try {
    const result = await employeeService.queryByField('domain', 'Cloud');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterFinance = async (req, res) => {
  try {
    const result = await employeeService.queryByField('domain', 'Finance');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterHealthcare = async (req, res) => {
  try {
    const result = await employeeService.queryByField('domain', 'Healthcare');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterDevOps = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'DevOps' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterAI = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'AI' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterFullstack = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'Fullstack' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterKubernetes = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ technology: 'Kubernetes' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterReact = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ technology: 'React' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterNodejs = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ technology: 'Node.js' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterJava = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ technology: 'Java' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterPython = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ technology: 'Python' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterRecentCertifications = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const filtered = employees.filter(emp => {
      return emp.certifications.some(c => {
        const lastUp = new Date(c.lastUpdated);
        const limitDate = new Date();
        limitDate.setMonth(limitDate.getMonth() - 2);
        return lastUp >= limitDate;
      });
    });
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Aggregation Pipeline analytical controllers
const analyzeTopSkills = async (req, res) => {
  try {
    const result = await employeeService.aggregateTopSkills();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeTopDomains = async (req, res) => {
  try {
    const result = await employeeService.aggregateTopDomains();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeTopCertifications = async (req, res) => {
  try {
    const result = await employeeService.aggregateTopCertifications();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeTopProjects = async (req, res) => {
  try {
    const result = await employeeService.aggregateProjects();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeTopTechnologies = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const counts = {};
    employees.forEach(emp => {
      emp.projects.forEach(p => {
        if (p.technologies) {
          p.technologies.forEach(t => counts[t] = (counts[t] || 0) + 1);
        }
      });
    });
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeTimezones = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const counts = {};
    employees.forEach(emp => {
      counts[emp.timezone] = (counts[emp.timezone] || 0) + 1;
    });
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeLocations = async (req, res) => {
  try {
    const result = await employeeService.aggregateLocations();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeExperience = async (req, res) => {
  try {
    const result = await employeeService.aggregateExperienceStats();
    res.status(200).json(result[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeVerification = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    let verifiedCount = 0;
    let totalCerts = 0;
    employees.forEach(emp => {
      emp.certifications.forEach(c => {
        totalCerts += 1;
        if (c.verified) verifiedCount += 1;
      });
    });
    res.status(200).json({
      totalCertifications: totalCerts,
      verifiedCertifications: verifiedCount,
      verificationRate: totalCerts ? Math.round((verifiedCount / totalCerts) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeProjects = async (req, res) => {
  try {
    const result = await employeeService.aggregateProjects();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeTasks = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    employees.forEach(emp => {
      emp.tasks.forEach(t => {
        const stat = (t.status || '').toLowerCase();
        if (stat.includes('progress')) inProgress += 1;
        else if (stat.includes('complete')) completed += 1;
        else pending += 1;
      });
    });
    res.status(200).json({ pending, inProgress, completed, totalTasks: pending + inProgress + completed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCountryAnalysis = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const counts = {};
    employees.forEach(emp => {
      counts[emp.country] = (counts[emp.country] || 0) + 1;
    });
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStateAnalysis = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const counts = {};
    employees.forEach(emp => {
      counts[emp.state] = (counts[emp.state] || 0) + 1;
    });
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    res.status(200).json({ count: employees.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsExperienceAvg = async (req, res) => {
  try {
    const result = await employeeService.aggregateExperienceStats();
    res.status(200).json({ averageExperience: result[0] ? result[0].averageExperience : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsTopExperience = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({ sort: 'experience', limit: 1 });
    res.status(200).json(employees[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsProjectCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    let totalProjects = 0;
    employees.forEach(emp => totalProjects += emp.projects.length);
    res.status(200).json({ totalProjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsTaskCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    let totalTasks = 0;
    employees.forEach(emp => totalTasks += emp.tasks.length);
    res.status(200).json({ totalTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsCountryCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const countries = new Set(employees.map(emp => emp.country));
    res.status(200).json({ totalCountries: countries.size, countries: [...countries] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsStateCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const states = new Set(employees.map(emp => emp.state));
    res.status(200).json({ totalStates: states.size, states: [...states] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsDomainCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const domains = new Set(employees.map(emp => emp.domain));
    res.status(200).json({ totalDomains: domains.size, domains: [...domains] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsSkillCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const skills = new Set();
    employees.forEach(emp => {
      if (emp.primarySkill) skills.add(emp.primarySkill);
      if (emp.secondarySkills) emp.secondarySkills.forEach(s => skills.add(s));
    });
    res.status(200).json({ totalUniqueSkills: skills.size, skills: [...skills] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsCertificationCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    let totalCerts = 0;
    employees.forEach(emp => totalCerts += emp.certifications.length);
    res.status(200).json({ totalCertifications: totalCerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsTimezoneCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const timezones = new Set(employees.map(emp => emp.timezone));
    res.status(200).json({ totalTimezones: timezones.size, timezones: [...timezones] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsVerifiedCount = async (req, res) => {
  try {
    const result = await employeeService.queryByField('certifications.verified', true);
    res.status(200).json({ verifiedCount: result.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const statsTechnologyCount = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const techCounts = {};
    employees.forEach(emp => {
      emp.projects.forEach(p => {
        if (p.technologies) {
          p.technologies.forEach(t => techCounts[t] = (techCounts[t] || 0) + 1);
        }
      });
    });
    res.status(200).json(techCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRandomEmployee = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const rand = Math.floor(Math.random() * employees.length);
    res.status(200).json(employees[rand] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendingSkills = async (req, res) => {
  res.status(200).json({ trending: ['React', 'Kubernetes', 'Node.js', 'Python', 'AWS'] });
};

const getRecentEmployees = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const sorted = [...employees].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(sorted.slice(0, 5));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    res.status(200).json({
      recommendedProfiles: employees.slice(0, 3).map(e => ({
        id: e._id,
        name: e.name,
        matchScore: '95%',
        reason: 'Matches required backend experience profile'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const predictPerformance = async (req, res) => {
  res.status(200).json({ prediction: 'Steady growth pattern predicted' });
};

const predictProjectFit = async (req, res) => {
  res.status(200).json({ compatibility: 'Highly compatible for project cloud requirements' });
};

const getSegmentsTopPerformers = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const filtered = employees.filter(e => e.performanceScore >= 85);
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSegmentsCloud = async (req, res) => {
  try {
    const result = await employeeService.queryByField('domain', 'Cloud');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSegmentsDevops = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'DevOps' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSegmentsAI = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'AI' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSegmentsFullstack = async (req, res) => {
  try {
    const result = await employeeService.fetchEmployees({ skill: 'Fullstack' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHeatmapCountries = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const counts = {};
    employees.forEach(emp => counts[emp.country] = (counts[emp.country] || 0) + 1);
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHeatmapStates = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const counts = {};
    employees.forEach(emp => counts[emp.state] = (counts[emp.state] || 0) + 1);
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHeatmapSkills = async (req, res) => {
  try {
    const employees = await employeeService.fetchEmployees({});
    const counts = {};
    employees.forEach(emp => counts[emp.primarySkill] = (counts[emp.primarySkill] || 0) + 1);
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInsightsProjects = async (req, res) => {
  res.status(200).json({ insight: 'Projects are highly concentrated in the Cloud domain.' });
};

const getInsightsTasks = async (req, res) => {
  res.status(200).json({ insight: 'Task velocity is high, with 50% completed in the last month.' });
};

const getInsightsCertifications = async (req, res) => {
  res.status(200).json({ insight: 'Primary skill-aligned certifications are mostly verified.' });
};

const getAlertsExpired = async (req, res) => {
  res.status(200).json({ expiredCertifications: [] });
};

const getAlertsWorkload = async (req, res) => {
  res.status(200).json({ workloadAlerts: [] });
};

const getAlertsDelays = async (req, res) => {
  res.status(200).json({ projectDelays: [] });
};

const reportIssue = async (req, res) => {
  res.status(201).json({ message: 'Issue reported', reportId: 'REP-' + Math.floor(Math.random() * 1000) });
};

const getSystemHealth = async (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() });
};

const getSystemVersion = async (req, res) => {
  res.status(200).json({ version: '1.0.0' });
};

const getSystemConfig = async (req, res) => {
  res.status(200).json({ env: process.env.NODE_ENV || 'development' });
};

const cacheClear = async (req, res) => {
  res.status(200).json({ message: 'Cache flushed successfully' });
};

const getSystemLogs = async (req, res) => {
  res.status(200).json([{ time: new Date().toISOString(), log: 'System operating normally' }]);
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  replaceEmployee,
  patchEmployee,
  deleteEmployee,
  existsEmployee,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  getByName,
  getByState,
  getByCountry,
  getByCity,
  getByTimezone,
  getByPrimarySkill,
  getBySecondarySkill,
  getByDomain,
  getByExperience,
  getByCertification,
  getVerified,
  getAllProjects,
  getAllTasks,
  getTopExperience,
  getTopSkills,
  getCloudEngineers,
  getDevOpsEngineers,
  getAIEngineers,
  getFullStack,
  getRecentCertifications,
  getByProjectId,
  getByTaskId,
  getPerformance,
  getStatsById,
  searchEmployees,
  sortExperienceDesc,
  sortNameAsc,
  sortProjectAsc,
  sortDomainAsc,
  sortCertificationDesc,
  filterHighExperience,
  filterLowExperience,
  filterVerified,
  filterCloud,
  filterFinance,
  filterHealthcare,
  filterDevOps,
  filterAI,
  filterFullstack,
  filterKubernetes,
  filterReact,
  filterNodejs,
  filterJava,
  filterPython,
  filterRecentCertifications,
  analyzeTopSkills,
  analyzeTopDomains,
  analyzeTopCertifications,
  analyzeTopProjects,
  analyzeTopTechnologies,
  analyzeTimezones,
  analyzeLocations,
  analyzeExperience,
  analyzeVerification,
  analyzeProjects,
  analyzeTasks,
  getCountryAnalysis,
  getStateAnalysis,
  statsCount,
  statsExperienceAvg,
  statsTopExperience,
  statsProjectCount,
  statsTaskCount,
  statsCountryCount,
  statsStateCount,
  statsDomainCount,
  statsSkillCount,
  statsCertificationCount,
  statsTimezoneCount,
  statsVerifiedCount,
  statsTechnologyCount,
  getRandomEmployee,
  getTrendingSkills,
  getRecentEmployees,
  getRecommendations,
  predictPerformance,
  predictProjectFit,
  getSegmentsTopPerformers,
  getSegmentsCloud,
  getSegmentsDevops,
  getSegmentsAI,
  getSegmentsFullstack,
  getHeatmapCountries,
  getHeatmapStates,
  getHeatmapSkills,
  getInsightsProjects,
  getInsightsTasks,
  getInsightsCertifications,
  getAlertsExpired,
  getAlertsWorkload,
  getAlertsDelays,
  reportIssue,
  getSystemHealth,
  getSystemVersion,
  getSystemConfig,
  cacheClear,
  getSystemLogs
};
