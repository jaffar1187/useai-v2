import { Command } from "commander";

const program = new Command();

program
  .name("useai")
  .description("Track and improve your AI coding sessions")
  .version("0.1.0");

program
  .command("stats")
  .description("Show session statistics")
  .action(async () => {
    // TODO: implement
    console.log("stats command — coming soon");
  });

program
  .command("serve")
  .description("Start daemon and open dashboard")
  .action(async () => {
    // TODO: implement
    console.log("serve command — coming soon");
  });

program
  .command("setup")
  .description("Set up useai for your AI tools")
  .action(async () => {
    // TODO: implement
    console.log("setup command — coming soon");
  });

program.parse();
