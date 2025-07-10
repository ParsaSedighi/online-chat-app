import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, userAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,
    group: ["create", "delete", "manageMembers"],
} as const;

export const ac = createAccessControl(statement);

const user = ac.newRole({
    ...userAc.statements, // Default user permissions
});

const GroupAdmin = ac.newRole({
    group: ["create", "delete", "manageMembers"], // Can manage groups
});

const admin = ac.newRole({
    ...adminAc.statements, // Default admin permissions (full control over users/sessions)
    group: ["create", "delete", "manageMembers"],
});

export const roles = {
    user,
    admin,
    GroupAdmin
}