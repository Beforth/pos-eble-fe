import { listRolesApi } from './roleService'
import {
  createUserApi,
  deleteUserApi,
  getUserApi,
  listUsersApi,
  updateUserApi,
  type UserSummary,
} from './userService'

/** Name of the seeded role (and role-group template) delivery staff belong to. */
export const DELIVERY_ROLE_NAME = 'Delivery Boy'

/**
 * Delivery boys are ordinary POS users whose role is "Delivery Boy" - there is
 * no separate table - so this screen is a role-filtered view of the users API.
 */
function isDeliveryBoy(user: UserSummary): boolean {
  const code = user.role?.code?.trim().toLowerCase()
  const name = user.role?.name?.trim().toLowerCase()
  return code === 'delivery' || name === DELIVERY_ROLE_NAME.toLowerCase()
}

/** The id of the Delivery Boy role; throws if the outlet's roles lack it. */
async function deliveryRoleId(): Promise<string> {
  const roles = await listRolesApi()
  const role = roles.find(
    (r) =>
      r.code.trim().toLowerCase() === 'delivery' ||
      r.name.trim().toLowerCase() === DELIVERY_ROLE_NAME.toLowerCase(),
  )
  if (!role) throw new Error('The Delivery Boy role is not set up')
  return role.id
}

export async function listDeliveryBoysApi(): Promise<UserSummary[]> {
  const users = await listUsersApi()
  return users.filter(isDeliveryBoy)
}

export { getUserApi as getDeliveryBoyApi }

export interface DeliveryBoyForm {
  name: string
  username: string
  userCode: string
  password: string
  phone: string
}

export async function createDeliveryBoyApi(form: DeliveryBoyForm): Promise<UserSummary> {
  return createUserApi({
    first_name: form.name.trim(),
    last_name: '',
    username: form.username.trim(),
    user_code: form.userCode.trim(),
    password: form.password,
    phone: form.phone.trim() || null,
    role_id: await deliveryRoleId(),
    group: DELIVERY_ROLE_NAME,
    is_active: true,
  })
}

/** A blank password leaves the current one unchanged. */
export async function updateDeliveryBoyApi(
  id: string,
  form: DeliveryBoyForm,
): Promise<UserSummary> {
  return updateUserApi(id, {
    first_name: form.name.trim(),
    last_name: '',
    username: form.username.trim(),
    user_code: form.userCode.trim(),
    phone: form.phone.trim() || null,
    ...(form.password ? { password: form.password } : {}),
  })
}

export { deleteUserApi as deleteDeliveryBoyApi }
