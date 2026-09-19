import { Types } from 'mongoose';
import { LoginPageConfig, LoginPageConfigDoc } from '../../models/LoginPageConfig';
import { findScoped } from '../../utils/scope';

export interface LoginPageConfigInput {
  preset: LoginPageConfigDoc['preset'];
  logoUrl?: string;
  backgroundImageUrl?: string;
  cssVariables: LoginPageConfigDoc['cssVariables'];
  customCss: string;
}

export async function getLoginPageConfig(companyId: Types.ObjectId, groupId?: string) {
  return findScoped(LoginPageConfig, companyId, groupId);
}

export async function upsertLoginPageConfig(
  companyId: Types.ObjectId,
  groupId: string | undefined,
  input: LoginPageConfigInput,
) {
  const filter = { companyId, groupId: groupId ?? '' };
  return LoginPageConfig.findOneAndUpdate(
    filter,
    { $set: { ...input, companyId, groupId: groupId ?? '' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
