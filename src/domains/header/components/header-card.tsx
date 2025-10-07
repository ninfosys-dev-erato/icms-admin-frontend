"use client";

import React from "react";
import { Column, Tile, Tag } from "@carbon/react";
import { HeaderConfig } from "../types/header";
import CardLogoSection from "./card-logo-section";
import CardInfoRow from "./card-info-row";

type Props = {
  header: HeaderConfig;
  onEdit: (h: HeaderConfig) => void;
  onView: (h: HeaderConfig) => void;
  onPreview: (h: HeaderConfig) => void;
  onDelete: (h: HeaderConfig) => void;
  onPublish: (h: HeaderConfig) => void;
  onUnpublish: (h: HeaderConfig) => void;
};

const HeaderCard: React.FC<Props> = ({
  header,
  onEdit,
  onView,
  onPreview,
  onDelete,
  onPublish,
  onUnpublish,
}) => {
  const hasLeftLogo = !!header.logo?.leftLogo?.mediaId;
  const hasRightLogo = !!header.logo?.rightLogo?.mediaId;

  // console.log("🔍 HeaderList - Header data:", {
  //   id: header.id,
  //   name: header.name,
  //   leftLogo: header.logo?.leftLogo,
  //   rightLogo: header.logo?.rightLogo,
  //   hasLeftLogo,
  //   hasRightLogo,
  // });

  return (
    <Column key={header.id} lg={16} md={8} sm={4}>
      <Tile className="header-card">
        {/* Top: #<order> */}
        <div className="card-header">
          <div className="card-header-content">
            <Tag size="sm" type="cool-gray">
              #{header.order}
            </Tag>
          </div>
        </div>

        {/* Content */}
        <div className="card-content">
          {(hasLeftLogo || hasRightLogo) && (
            <CardLogoSection
              header={header}
              hasLeftLogo={hasLeftLogo}
              hasRightLogo={hasRightLogo}
            />
          )}

          {/* Bottom row – keep tags on the left and menu on the right */}
          <CardInfoRow
            header={header}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onPreview={onPreview}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
          />
        </div>
      </Tile>
    </Column>
  );
};

export default HeaderCard;
