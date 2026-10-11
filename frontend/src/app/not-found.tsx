import Link from "next/link";
import type { CSSProperties } from "react";

import { buttonVariants } from "@/components/ui/button";

const containerStyle: CSSProperties = {
  fontFamily:
    'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
  height: "100vh",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const headingStyle: CSSProperties = {
  display: "inline-block",
  margin: "0 20px 0 0",
  padding: "0 23px 0 0",
  fontSize: 24,
  fontWeight: 500,
  verticalAlign: "top",
  lineHeight: "49px",
};

const descriptionStyle: CSSProperties = {
  display: "inline-block",
};

const messageStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 400,
  lineHeight: "49px",
  margin: 0,
};

export default function NotFound() {
  return (
    <>
      <title>404: This page could not be found.</title>
      <div style={containerStyle}>
        <div>
          <style
            dangerouslySetInnerHTML={{
              __html:
                "body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}",
            }}
          />
          <h1 className="next-error-h1" style={headingStyle}>
            404
          </h1>
          <div style={descriptionStyle}>
            <h2 style={messageStyle}>This page could not be found.</h2>
          </div>
        </div>
        <Link href="/" className={buttonVariants()} style={{ marginTop: 24 }}>
          Back to dashboard
        </Link>
      </div>
    </>
  );
}
