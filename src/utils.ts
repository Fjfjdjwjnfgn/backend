import { getAuthName, getAuthPassword } from "@config";
import type { ConnectionInfo } from "@db";

export const checkCredentials = ({
	username,
	password,
}: {
	username: string,
	password: string,
}) => (
	username === getAuthName() &&
	password === getAuthPassword()
);

export function countIpsFromConnections(conns: ConnectionInfo[]) {
	const ips = new Set<string>();
	conns.forEach(({ ip }) => ip && ips.add(ip));
	return {
		ips: ips.size,
	}
}