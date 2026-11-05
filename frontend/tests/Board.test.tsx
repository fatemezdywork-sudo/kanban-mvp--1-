import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Board from "../src/components/Board";
describe("board interactions", () => {
  it("renders five editable columns and ten sample cards", () => {
    render(<Board />);
    expect(screen.getAllByRole("textbox", { name: /نام ستون/ })).toHaveLength(
      5,
    );
    expect(screen.getAllByRole("button", { name: /حذف کارت/ })).toHaveLength(
      10,
    );
  });
  it("adds a trimmed card into the selected column and updates the count", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const column = screen.getByTestId("column-review");
    await user.click(
      within(column).getByRole("button", { name: "افزودن کارت" }),
    );
    await user.type(screen.getByLabelText(/عنوان کارت/), "  تست تازه  ");
    await user.type(screen.getByLabelText(/جزئیات/), "توضیحات تست");
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "افزودن کارت",
      }),
    );
    expect(
      within(column).getByRole("heading", { name: "تست تازه" }),
    ).toBeInTheDocument();
    expect(within(column).getByText("توضیحات تست")).toBeInTheDocument();
    expect(screen.getByText("۱۱ کارت")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("prevents blank titles and permits empty details", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "کارت جدید" }));
    const dialog = screen.getByRole("dialog");
    const submit = within(dialog).getByRole("button", { name: "افزودن کارت" });
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText(/عنوان کارت/), "   ");
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText(/عنوان کارت/), "کار جدید");
    await user.click(submit);
    expect(screen.getByText("بدون جزئیات")).toBeInTheDocument();
  });
  it("cancels without creating a card and resets the form on reopen", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "کارت جدید" }));
    await user.type(screen.getByLabelText(/عنوان کارت/), "ذخیره نشود");
    await user.click(screen.getByRole("button", { name: "انصراف" }));
    expect(screen.queryByText("ذخیره نشود")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "کارت جدید" }));
    expect(screen.getByLabelText(/عنوان کارت/)).toHaveValue("");
  });
  it("deletes only the requested card", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(
      screen.getByRole("button", { name: "حذف کارت یک شروع تازه برای برند" }),
    );
    expect(
      screen.queryByRole("heading", { name: "یک شروع تازه برای برند" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("۹ کارت")).toBeInTheDocument();
  });
  it("commits a rename on Enter and restores an empty rename", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const input = screen.getByLabelText("نام ستون 1");
    await user.clear(input);
    await user.type(input, "قدم اول{Enter}");
    expect(screen.getByRole("region", { name: "قدم اول" })).toBeInTheDocument();
    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue("قدم اول");
  });
  it("cancels a rename with Escape", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const input = screen.getByLabelText("نام ستون 1");
    await user.clear(input);
    await user.type(input, "لغو{Escape}");
    expect(input).toHaveValue("ایده‌ها");
    expect(screen.getByRole("region", { name: "ایده‌ها" })).toBeInTheDocument();
  });
  it("returns focus to the add trigger after cancel", async () => {
    const user = userEvent.setup();
    render(<Board />);
    const trigger = screen.getByRole("button", { name: "کارت جدید" });
    await user.click(trigger);
    expect(screen.getByLabelText(/عنوان کارت/)).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "انصراف" }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(trigger).toHaveFocus();
  });
  it("keeps new identifiers unique after deleting and adding again", async () => {
    const user = userEvent.setup();
    render(<Board />);
    for (const title of ["اول", "دوم"]) {
      await user.click(screen.getByRole("button", { name: "کارت جدید" }));
      await user.type(screen.getByLabelText(/عنوان کارت/), title);
      await user.click(
        within(screen.getByRole("dialog")).getByRole("button", {
          name: "افزودن کارت",
        }),
      );
    }
    await user.click(screen.getByRole("button", { name: "حذف کارت اول" }));
    await user.click(screen.getByRole("button", { name: "کارت جدید" }));
    await user.type(screen.getByLabelText(/عنوان کارت/), "سوم");
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "افزودن کارت",
      }),
    );
    expect(screen.getByTestId("card-c12")).toBeInTheDocument();
    expect(screen.getByTestId("card-c13")).toBeInTheDocument();
    expect(screen.queryByTestId("card-c11")).not.toBeInTheDocument();
  });
});
