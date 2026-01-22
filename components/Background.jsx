import React from "react";

const Background = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "40vh",
        width: "100%",
        background: `
          linear-gradient(
            180deg,
            #c9f3cf 0%,
            #bfeedd 30%,
            #b7e3f0 55%,
            #eef7fb 80%,
            #ffffff 100%
          )
        `,
      }}
    >
      {children}
    </div>
  );
};

export default Background;
