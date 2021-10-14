import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Article } from "../../pages/WhatIsHealthEquity/BlogTab";
import { getMadLibPhraseText, MadLib } from "../../utils/MadLibs";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
} from "react-share";
import parse from "html-react-parser";

function ShareDialog(props: {
  shareModalOpen: boolean;
  setShareModalOpen: (shareModalOpen: boolean) => void;
  madLib?: MadLib;
  article?: Article;
}) {
  const [textCopied, setTextCopied] = useState(false);
  let text = window.location.href;
  if (process.env.NODE_ENV === "development")
    text = text.replace(
      "http://localhost:3000",
      "https://healthequitytracker.org"
    );

  let title: string = "";
  if (props.article) title = parse(props.article.title.rendered) as string;
  if (props.madLib) title = getMadLibPhraseText(props.madLib);

  return (
    <Dialog
      open={props.shareModalOpen}
      onClose={() => {
        props.setShareModalOpen(false);
        setTextCopied(false);
      }}
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {/* SOCIAL SHARE BUTTONS */}
        <FacebookShareButton url={text} hashtag={"#healthequity"}>
          <FacebookIcon size={32} />
        </FacebookShareButton>

        <TwitterShareButton
          url={text}
          title={title}
          hashtags={["healthequity"]}
        >
          <TwitterIcon size={32} />
        </TwitterShareButton>

        <EmailShareButton
          subject={`Sharing from healthequitytracker.org`}
          body={`Please see this ${
            props.article ? "article" : "report"
          } from the Health Equity Tracker: “${title}”
        
`} // KEEP THIS WEIRD SPACING FOR EMAIL LINE BREAKS!
          url={text}
        >
          <EmailIcon size={32} />
        </EmailShareButton>

        <LinkedinShareButton
          title={title}
          source={"Health Equity Tracker"}
          url={text}
        >
          <LinkedinIcon size={32} />
        </LinkedinShareButton>

        <DialogContentText>
          <CopyToClipboard text={text} onCopy={() => setTextCopied(true)}>
            <Button startIcon={<FileCopyIcon />}>Copy link to clipboard</Button>
          </CopyToClipboard>
          {textCopied && (
            <span role="alert" aria-label="Success. Press Escape Key to close">
              Link copied!
            </span>
          )}
        </DialogContentText>
        <DialogContentText>
          <FormControl fullWidth>
            <TextField
              id="report-link"
              variant="outlined"
              defaultValue={text}
            />
          </FormControl>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
