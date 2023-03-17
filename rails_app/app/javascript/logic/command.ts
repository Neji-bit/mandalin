class Command {
  static output = () => {
    const text: string = "The command."
    return text
  }

  static parse = (data: string) => {
    console.log("Command.parse: " + data)
    return "I am parse."
  }
}

export default Command
