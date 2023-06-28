import { FC } from "react";
import { trpc } from "../../../lib/trpc";

const Register: FC = () => {
  const { isLoading, mutate: registerMutation } = trpc.auth.register.useMutation();
  const trpcContext = trpc.useContext();

  const handleRegister = async () => {
    registerMutation(
      {
        email: "petdrgfdos@gmail.com",
        password: "123456",
        name: "petros rodinos",
      },
      {
        onSuccess: (data: any) => {
          console.log("created user", data);
          // trpcContext.auth.invalidate();
        },
        onError: (error) => {
          console.log("error", error.message);
        },
      }
    );
  };

  return (
    <div>
      <h1>register</h1>
      {isLoading && <div>loading...</div>}
      <button onClick={handleRegister}>register</button>
    </div>
  );
};

export default Register;