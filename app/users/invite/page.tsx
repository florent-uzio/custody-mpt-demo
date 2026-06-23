"use client";

import { Page, PageHeader, PageContainer, PageHero } from "../../components/layout";
import { UserCreateTab } from "../../components/UserCreateTab";

export default function InviteUserPage() {
  return (
    <Page>
      <PageHeader
        title="User Invitation"
        subtitle="Users · Invite"
        breadcrumbs={[{ label: "Users", href: "/users" }, { label: "Invite" }]}
      />
      <PageContainer width="form">
        <PageHero
          theme="teal"
          icon="✉️"
          title="User Invitation"
          description="Invite a new user to the platform by providing their details below."
          badge={{ label: "Invite user", note: "Creates a new platform user" }}
        />
        <UserCreateTab />
      </PageContainer>
    </Page>
  );
}
