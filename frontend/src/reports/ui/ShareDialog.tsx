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

export const SHARE_ICON_SIZE = 64;

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

  let title: string = "Health Equity Tracker";
  if (props.madLib) {
    title += ": " + getMadLibPhraseText(props.madLib);
  }
  if (props.article) {
    title += ((": “" + parse(props.article.title.rendered)) as string) + "”";

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

          <TwitterShareButton
            url={text}
            title={title}
            hashtags={["healthequity"]}
            related={["@SatcherHealth", "@MSMEDU"]}
          >
            <TwitterIcon size={SHARE_ICON_SIZE} />
          </TwitterShareButton>

          <FacebookShareButton
            url={text}
            hashtag={"#healthequity"}
            quote={title}
          >
            <FacebookIcon size={SHARE_ICON_SIZE} />
          </FacebookShareButton>

          <LinkedinShareButton
            title={title}
            // summary={summary}
            source={"Health Equity Tracker"}
            url={text}
          >
            <LinkedinIcon size={SHARE_ICON_SIZE} />
          </LinkedinShareButton>

          <EmailShareButton
            subject={`Sharing from healthequitytracker.org`}
            body={`${title}
        
`} // KEEP THIS WEIRD SPACING FOR EMAIL LINE BREAKS!
            url={text}
          >
            <EmailIcon size={SHARE_ICON_SIZE} />
          </EmailShareButton>

          <DialogContentText>
            <CopyToClipboard text={text} onCopy={() => setTextCopied(true)}>
              <Button startIcon={<FileCopyIcon />}>
                {textCopied ? (
                  <span
                    role="alert"
                    aria-label="Link copied to clipboard. Press Escape Key to close"
                  >
                    Link copied!
                  </span>
                ) : (
                  "Copy link to clipboard"
                )}
              </Button>
            </CopyToClipboard>
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
}
export default ShareDialog;
