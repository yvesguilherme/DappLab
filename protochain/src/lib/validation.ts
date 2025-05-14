class Validation {
  readonly success: boolean;
  readonly message: string;

  /**
   * Create a new Validation object
   * @param success if the validation was successful
   * @param message the validation message, if validation failed
   */
  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;

    Object.freeze(this);
  }

  static success(): Validation {
    return new Validation(true, '');
  }

  static failure(message: string): Validation {
    if (!message) {
      throw new Error('Validation failure requires a descriptive message!');
    }

    return new Validation(false, message);
  }
}

export default Validation;