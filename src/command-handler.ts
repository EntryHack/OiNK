import { readdirSync } from "fs";
import { join } from "path";
import Post from "./post";

type Command = (post: Post, args: string[]) => Promise<void> | void;
export const Command = (func: Command) => func;

const getCommands = (path: string) => {
  const commands = new Map<string, Command>();

  readdirSync(path).forEach((file) =>
    commands.set(file.slice(0, file.lastIndexOf(".")), require(join(path, file)).default)
  );

  return (command: string) => commands.get(command);
};

export default getCommands;
