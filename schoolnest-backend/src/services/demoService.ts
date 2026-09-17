import { DemoRequest, IDemoRequest } from '../models/DemoRequest';

export const createDemoRequest = async (demoData: Partial<IDemoRequest>) => {
  const demo = new DemoRequest(demoData);
  return await demo.save();
};

export const getDemoRequests = async () => {
  return await DemoRequest.find({}).sort({ createdAt: -1 });
};
