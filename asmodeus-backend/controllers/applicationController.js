export const createApplication = async (req, res) => {
  const { job_id } = req.body || {};

  if (req.user?.role_id !== 4) {
    return res.status(403).json({ message: "Access denied. Only candidates can apply." });
  }

  if (!job_id) {
    return res.status(400).json({ message: "job_id is required." });
  }

  // At this stage, we only enforce access control.
  // Persistence can be added later once the Applications table is defined.
  return res.status(201).json({ message: "Application received.", job_id });
};


